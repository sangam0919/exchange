const axios = require("axios");
const jwt = require("jsonwebtoken");
const { User, Wallet } = require("../models/index");
const { createSmartAccount } = require("../utill/smartAccount");
const { ethers } = require("ethers");
const crypto = require("crypto");

const walletLoginChallenges = new Map();

exports.getKakaoAuthUrl = (req, res) => {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}`;
  res.json({ url: kakaoAuthUrl });
};

exports.kakaoLogin = async (req, res) => {
  const { code } = req.query;

  try {
    const tokenRes = await axios.post("https://kauth.kakao.com/oauth/token", null, {
      params: {
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
        client_secret: process.env.KAKAO_CLIENT_SECRET_KEY || undefined,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const kakaoUser = userRes.data;
    const kakaoId = Number(kakaoUser.id);
    const nickname = kakaoUser.properties?.nickname ?? "";
    const profile = kakaoUser.properties?.profile_image ?? "";

    let user = await User.findOne({ where: { uid: kakaoId } });
    if (!user) {
      user = await User.create({
        uid: kakaoId,
        nickname,
        profile_image: profile,
      });
    }

    const existingWallet = await Wallet.findOne({ where: { userId: user.id } });

    if (!existingWallet) {
      const { address, publicKey } = await createSmartAccount(user.uid);

      await Wallet.create({
        userId: user.id,
        address,
        publicKey,
      });

      console.log("✅ 스마트 지갑 생성 완료:", address);
    }

    const token = jwt.sign({ userId: user.uid }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:3000");
  } catch (err) {
    console.error("카카오 로그인 실패:", err.message);
    res.status(500).json({ success: false, message: "카카오 로그인 실패" });
  }
};

// Local-only development account. This endpoint is deliberately unavailable in production
// and to requests that do not originate from the local machine.
exports.localAdminLogin = async (req, res) => {
  const remoteAddress = req.ip || req.socket?.remoteAddress || "";
  const isLoopback = remoteAddress === "::1" || remoteAddress === "::ffff:127.0.0.1" || remoteAddress.startsWith("127.");
  if (process.env.NODE_ENV === "production" || !isLoopback) {
    return res.status(404).json({ message: "Not found" });
  }

  const expectedUsername = process.env.LOCAL_ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.LOCAL_ADMIN_PASSWORD || "admin1234";
  const { username, password } = req.body || {};
  if (username !== expectedUsername || password !== expectedPassword) {
    return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }

  try {
    const uid = "local-admin";
    const [user] = await User.findOrCreate({
      where: { uid },
      defaults: { uid, nickname: "로컬 관리자" },
    });
    const token = jwt.sign({ userId: user.uid }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ id: user.id, nickname: user.nickname, uid: user.uid });
  } catch (err) {
    console.error("Local login failed:", err);
    return res.status(500).json({ message: "로그인 처리 중 오류가 발생했습니다." });
  }
};

exports.createWalletLoginChallenge = (req, res) => {
  const address = req.body?.address;
  if (!ethers.isAddress(address || "")) {
    return res.status(400).json({ message: "올바른 지갑 주소가 아닙니다." });
  }
  const normalizedAddress = ethers.getAddress(address);
  const nonce = crypto.randomBytes(24).toString("hex");
  const issuedAt = new Date().toISOString();
  const message = [
    "Sign in to SA Exchange",
    `Address: ${normalizedAddress}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
  walletLoginChallenges.set(normalizedAddress.toLowerCase(), {
    nonce,
    message,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  return res.json({ message });
};

exports.walletLogin = async (req, res) => {
  const { address, signature } = req.body || {};
  if (!ethers.isAddress(address || "") || typeof signature !== "string") {
    return res.status(400).json({ message: "지갑 주소와 서명이 필요합니다." });
  }

  const normalizedAddress = ethers.getAddress(address);
  const challengeKey = normalizedAddress.toLowerCase();
  const challenge = walletLoginChallenges.get(challengeKey);
  walletLoginChallenges.delete(challengeKey);
  if (!challenge || challenge.expiresAt < Date.now()) {
    return res.status(401).json({ message: "로그인 요청이 만료됐습니다. 다시 시도해 주세요." });
  }

  try {
    const signer = ethers.verifyMessage(challenge.message, signature);
    if (signer.toLowerCase() !== challengeKey) {
      return res.status(401).json({ message: "지갑 서명을 확인할 수 없습니다." });
    }
    const uid = challengeKey;
    const [user] = await User.findOrCreate({
      where: { uid },
      defaults: { uid, nickname: `${normalizedAddress.slice(0, 6)}…${normalizedAddress.slice(-4)}` },
    });
    const token = jwt.sign({ userId: user.uid }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ id: user.id, nickname: user.nickname, uid: user.uid, address: normalizedAddress });
  } catch (err) {
    console.error("Wallet login failed:", err.message);
    return res.status(401).json({ message: "지갑 서명을 확인할 수 없습니다." });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("http://localhost:3000/");
};

exports.getUserInfo = (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    nickname: user.nickname,
    profile: user.profile_image,
    uid: user.uid,
    bio: user.bio,
  });
};

exports.registerUser = async (req, res) => {
  try {
    const { uid, nickname } = req.body;
    let user = await User.findOne({ where: { uid } });
    if (!user) {
      user = await User.create({ uid, nickname });
    }
    return res.status(200).json({ message: "유저 등록 완료", user });
  } catch (err) {
    console.error("유저 등록 오류:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

exports.getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ where: { uid } });
    if (!user) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error("유저 조회 오류:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};
