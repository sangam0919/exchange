const { ethers } = require("ethers");

exports.createSmartAccount = async (uid) => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
  };
};