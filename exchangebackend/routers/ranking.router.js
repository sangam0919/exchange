const express = require("express");
const router = express.Router();
const rankingController = require("../controllers/ranking.controller");

// 랭킹 등록 또는 갱신
router.post("/update", rankingController.updateRanking);

// 전체 랭킹 조회
router.get("/all", rankingController.getAllRanking);

module.exports = router;
