require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.30",
  networks : {
    sepolia : {
      url: process.env.INFURA_RPC,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 40000000000,
      timeout: 200000,
    },
  }
};
