const jwt = require("jsonwebtoken");
const { User } = require("../models/index");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { uid: decoded.userId } });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    req.user = user; // 다음 라우터에서 req.user로 접근 가능
    next();
  } catch (err) {
    console.error("인증 오류:", err.message);
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};

module.exports = authMiddleware;
