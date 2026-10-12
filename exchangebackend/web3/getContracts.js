const { ethers } = require("ethers");
require("dotenv").config();
const entryPointAbi = require("../abi/EntryPoint.json").abi;

const getContracts = () => {
  const { RPC_URL, ADMIN_PRIVATE_KEY, ENTRYPOINT_ADDRESS } = process.env;
  if (!RPC_URL || !ADMIN_PRIVATE_KEY || !ENTRYPOINT_ADDRESS) {
    console.warn("온체인 env가 없어 컨트랙트 연결을 건너뜁니다.");
    return null;
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  const entryPoint = new ethers.Contract(ENTRYPOINT_ADDRESS, entryPointAbi, wallet);

  return { entryPoint, wallet };
};

module.exports = getContracts;
