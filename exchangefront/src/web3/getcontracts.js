import { ethers } from 'ethers';
import ExchangeABI from './abi/MockExchange.json';
import TokenABI from './abi/MockToken.json';

const exchangeAddress = process.env.REACT_APP_EXCHANGE_ADDRESS;
const krwAddress = process.env.REACT_APP_KRW_TOKEN_ADDRESS;
const btcAddress = process.env.REACT_APP_BTC_TOKEN_ADDRESS;

const getContracts = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const exchangeContract = new ethers.Contract(exchangeAddress, ExchangeABI.abi, signer);
  const krwContract = new ethers.Contract(krwAddress, TokenABI.abi, signer);
  const btcContract = new ethers.Contract(btcAddress, TokenABI.abi, signer);

  return { exchangeContract, krwContract, btcContract };
};

export default getContracts;
