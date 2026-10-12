const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");

// 지갑 등록 (POST)
router.post("/create", walletController.createWallet);

// 유저 지갑 조회 (GET)
router.get("/:userId", walletController.getWalletByUser);

module.exports = router;
