const cron = require("node-cron");
const { Order, sequelize } = require("../config/config");
const getContracts = require("../web3/getContracts");

const processOrder = async (order) => {
  try {
    const { exchangeContract } = getContracts();

    const amount = order.amount;
    const price = order.price;

    if (order.orderType === "BUY") {
      const tx = await exchangeContract.buyToken(amount, price);
      await tx.wait();
    } else {
      const tx = await exchangeContract.sellToken(amount, price);
      await tx.wait();
    }

    order.status = "EXECUTED";
    order.executedAt = new Date();
    await order.save();

    console.log(`✅ 주문 처리 완료 - ${order.orderType} / ID: ${order.id}`);
  } catch (err) {
    console.error(`❌ 스마트컨트랙트 처리 실패 - ID: ${order.id}`, err);
    order.status = "FAILED";
    await order.save();
  }
};

const runOrderProcessor = async () => {
  console.log("🕒 주문 스케줄러 실행");
  const pendingOrders = await Order.findAll({ where: { status: "PENDING" } });

  for (const order of pendingOrders) {
    await processOrder(order);
  }

  console.log("✅ 전체 주문 처리 완료");
};

// 매 4시간마다 실행
cron.schedule("0 */4 * * *", () => {
  runOrderProcessor();
});
