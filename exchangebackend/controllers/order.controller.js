const { Order, User } = require("../models/index");

// 주문 생성 (매수 or 매도)
exports.createOrder = async (req, res) => {
  try {
    const { userId, orderType, amount, price } = req.body;

    if (!["BUY", "SELL"].includes(orderType)) {
      return res.status(400).json({ message: "잘못된 주문 유형입니다." });
    }

    const order = await Order.create({
      userId,
      orderType,
      amount,
      price,
    });

    return res.status(201).json({ message: "주문이 등록되었습니다.", order });
  } catch (err) {
    console.error("주문 생성 오류:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 대기 중인 주문 전체 조회
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: "PENDING" },
      include: [{ model: User, attributes: ["uid", "nickname"] }]
    });

    return res.status(200).json(orders);
  } catch (err) {
    console.error("주문 조회 오류:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 주문 취소
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order || order.status !== "PENDING") {
      return res.status(404).json({ message: "존재하지 않거나 취소 불가능한 주문입니다." });
    }

    order.status = "CANCELLED";
    await order.save();

    return res.status(200).json({ message: "주문이 취소되었습니다." });
  } catch (err) {
    console.error("주문 취소 오류:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};
