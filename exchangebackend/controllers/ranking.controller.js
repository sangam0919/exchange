const { Ranking, User } = require("../models/index");

// 랭킹 등록 또는 갱신
exports.updateRanking = async (req, res) => {
  try {
    const { userId, totalAsset, profitRate } = req.body;

    let ranking = await Ranking.findOne({ where: { userId } });

    if (ranking) {
      ranking.totalAsset = totalAsset;
      ranking.profitRate = profitRate;
      await ranking.save();
    } else {
      ranking = await Ranking.create({ userId, totalAsset, profitRate });
    }

    return res.status(200).json({ message: "랭킹 정보 저장 완료", ranking });
  } catch (err) {
    console.error("랭킹 저장 오류:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 전체 랭킹 조회 (내림차순)
exports.getAllRanking = async (req, res) => {
  try {
    const rankings = await Ranking.findAll({
      include: [{ model: User, attributes: ["uid", "nickname"] }],
      order: [["totalAsset", "DESC"]]
    });

    return res.status(200).json(rankings);
  } catch (err) {
    console.error(" 랭킹 조회 오류:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};
