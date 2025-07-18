const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Mock Exchange", () => {
  let token, exchange, owner, user1;
  // console.log("ethers:", ethers);
  // console.log("ethers.utils:", ethers.utils);
  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockToken");
    token = await Token.deploy(ethers.utils.parseEther("1000000"));
    await token.deployed();

    const Exchange = await ethers.getContractFactory("MockExchange");
    exchange = await Exchange.deploy(token.address);
    await exchange.deployed();

    await token.transfer(user1.address, ethers.utils.parseEther("1000"));
    await token.connect(user1).approve(exchange.address, ethers.utils.parseEther("100000"));
  });

  it("should let user1 place a buy order", async () => {
    await exchange.connect(user1).placeOrder(10, 2, 0); // BUY
    const orders = await exchange.getMyOrders(user1.address);
    expect(orders.length).to.equal(1);
    expect(orders[0].orderType).to.equal(0);
  });

  it("should let user1 place a sell order", async () => {
    await exchange.connect(user1).placeOrder(10, 2, 1); 
    const orders = await exchange.getMyOrders(user1.address);
    expect(orders[0].orderType).to.equal(1);
  });
});
