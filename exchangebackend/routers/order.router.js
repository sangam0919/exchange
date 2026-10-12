const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

// 주문 생성 (POST)
router.post("/create", orderController.createOrder);

// 대기 중인 주문 조회 (GET)
router.get("/pending", orderController.getPendingOrders);

// 주문 취소 (PATCH or DELETE)
router.patch("/cancel/:orderId", orderController.cancelOrder);

module.exports = router;
