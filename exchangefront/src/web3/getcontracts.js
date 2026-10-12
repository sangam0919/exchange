import { ethers } from "ethers";
import EntryPointABI from "./abi/EntryPoint.json";
import MockTokenABI from "./abi/MockToken.json";
import SmartAccountABI from "./abi/SmartAccount.json";
import AbstractExchangeABI from "./abi/AbstractExchange.json";

const getContracts = async (smartAccountAddress) => {
  if (!window.ethereum) {
    throw new Error("MetaMask 또는 호환 지갑을 연결해 주세요.");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const accounts = await provider.send("eth_accounts", []);
  if (!accounts.length) {
    throw new Error("거래하려면 지갑을 먼저 연결해 주세요.");
  }
  const signer = provider.getSigner();

  const entryPointAddress = process.env.REACT_APP_ENTRYPOINT_ADDRESS;
  const krwAddress = process.env.REACT_APP_KRW_TOKEN_ADDRESS;
  const btcAddress = process.env.REACT_APP_BTC_TOKEN_ADDRESS;
  const exchangeAddress = process.env.REACT_APP_EXCHANGE_ADDRESS;

  if (!krwAddress || !btcAddress || !exchangeAddress) {
    throw new Error("컨트랙트 주소가 설정되지 않았습니다. exchangefront/.env를 확인해 주세요.");
  }

  const entryPointContract = entryPointAddress
    ? new ethers.Contract(entryPointAddress, EntryPointABI.abi, signer)
    : null;
  const krwContract = new ethers.Contract(krwAddress, MockTokenABI.abi, signer);
  const btcContract = new ethers.Contract(btcAddress, MockTokenABI.abi, signer);
  const exchangeContract = new ethers.Contract(exchangeAddress, AbstractExchangeABI.abi, signer);
  const smartAccountContract = smartAccountAddress
    ? new ethers.Contract(smartAccountAddress, SmartAccountABI.abi, signer)
    : null;

  return {
    entryPointContract,
    krwContract,
    btcContract,
    exchangeContract,
    smartAccountContract,
    signer,
  };
};


export default getContracts;
