const { Wallet, User } = require("../models");
const { createSmartAccount } = require("../utill/smartAccount"); // 스마트 계정 생성 함수

// 1. 수동으로 지갑 생성 (테스트용 또는 수동 입력용)
exports.createWallet = async (req, res) => {
  try {
    const { userId, address, publicKey } = req.body;

    const exists = await Wallet.findOne({ where: { userId } });
    if (exists) {
      return res.status(400).json({ message: "이미 지갑이 존재합니다." });
    }

    const wallet = await Wallet.create({ userId, address, publicKey });
    return res.status(201).json({ message: "지갑 생성 완료", wallet });
  } catch (err) {
    console.error("지갑 생성 오류:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 2. 특정 유저(userId)의 지갑 조회
exports.getWalletByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({
      where: { userId },
      include: [{ model: User, attributes: ["uid", "nickname"] }]
    });

    if (!wallet) {
      return res.status(404).json({ message: "지갑을 찾을 수 없습니다." });
    }

    return res.status(200).json(wallet);
  } catch (err) {
    console.error("지갑 조회 오류:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 3. 로그인 후 자동 지갑 생성 (uid로 생성하고 publicKey까지 저장)
exports.autoConnectWallet = async (req, res) => {
  try {
    const { uid } = req.body;

    const user = await User.findOne({ where: { uid } });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const existingWallet = await Wallet.findOne({ where: { userId: user.id } });
    if (existingWallet) {
      return res.status(200).json({ address: existingWallet.address });
    }

    // 스마트 지갑 + 공개키 자동 생성
    const { address, publicKey } = await createSmartAccount(user.uid);

    const newWallet = await Wallet.create({
      userId: user.id,
      address,
      publicKey
    });

    return res.status(201).json({ address });
  } catch (err) {
    console.error("자동 지갑 생성 오류:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};
