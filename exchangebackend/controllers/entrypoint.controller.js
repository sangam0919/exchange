const getContracts = require("../web3/getContracts");

let userOpQueue = []; // 4시간 동안 쌓을 큐

// 요청 받은 userOp 저장
const enqueueUserOp = (req, res) => {
  const userOp = req.body.userOp;
  userOpQueue.push(userOp);
  console.log(" userOp 저장됨:", userOp.sender);
  res.json({ success: true });
};

// 4시간마다 실행되는 배치 처리 함수
const handleBatchUserOps = async () => {
  if (userOpQueue.length === 0) {
    console.log(" 처리할 userOp 없음.");
    return;
  }

  const contracts = getContracts();
  if (!contracts) {
    console.warn("온체인 env 없음 — batch 처리 skip");
    return;
  }
  const { entryPoint, wallet } = contracts;
  try {
    const tx = await entryPoint.handleOps(userOpQueue, wallet.address);
    await tx.wait();
    console.log(" batch 처리 완료! tx:", tx.hash);
    userOpQueue = []; // 큐 초기화
  } catch (err) {
    console.error(" 처리 실패:", err.message);
  }
};

module.exports = {
  enqueueUserOp,
  handleBatchUserOps,
};
