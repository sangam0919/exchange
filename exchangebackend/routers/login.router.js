const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// 로그인된 유저 정보 조회 (미들웨어 적용)
router.get("/user", authMiddleware, userController.getUserInfo);

// 카카오 로그인 관련
router.get("/kakao", userController.getKakaoAuthUrl);
router.get("/kakao_login", userController.kakaoLogin);
router.post("/wallet/nonce", userController.createWalletLoginChallenge);
router.post("/wallet", userController.walletLogin);
router.post("/local", userController.localAdminLogin);
router.get("/logout", userController.logout);

// 유저 등록 / 조회
router.post("/register", userController.registerUser);
router.get("/:uid", userController.getUserByUid);

module.exports = router;
