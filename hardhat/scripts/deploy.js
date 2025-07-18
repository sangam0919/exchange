const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("📦 Deploying contracts with account:", deployer.address);

  const MockToken = await hre.ethers.getContractFactory("MockToken");

  // 1. KRW Token 배포 (초기 공급 없음)
  const krwToken = await MockToken.deploy("0");
  await krwToken.deployed();
  console.log("✅ KRW Token deployed to:", krwToken.address);

  // 2. BTC Token 배포 (초기 공급 1,000,000 BTC to deployer)
  const initialBTC = hre.ethers.utils.parseUnits("1000000", 18);
  const btcToken = await MockToken.deploy(initialBTC.toString());
  await btcToken.deployed();
  console.log("✅ BTC Token deployed to:", btcToken.address);

  // 3. Exchange 컨트랙트 배포 (⚠️ symbol 제거됨!)
  const Exchange = await hre.ethers.getContractFactory("MockExchange");
  const exchange = await Exchange.deploy(krwToken.address, btcToken.address);
  await exchange.deployed();
  console.log("✅ Exchange deployed to:", exchange.address);

  // 4. BTC를 Exchange에 예치 (넉넉하게)
  await btcToken.transfer(exchange.address, initialBTC);
  console.log("💰 거래소에 BTC 예치 완료:", hre.ethers.utils.formatUnits(initialBTC, 18), "BTC");

  // 5. (선택) Exchange가 BTC를 사용할 수 있도록 approve (사실은 receive만 하므로 필요는 없음)
  await btcToken.approve(exchange.address, initialBTC);
  console.log("📝 Exchange approved to spend BTC (optional)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
