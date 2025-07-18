// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IERC20 {
    function transferFrom(address from, address to, uint amount) external returns (bool);
    function transfer(address to, uint amount) external returns (bool);
    function balanceOf(address account) external view returns (uint);
}

contract MockExchange {
    address public krwToken;
    address public btcToken;

    enum OrderType { BUY, SELL }

    struct Order {
        address user;
        uint amount;
        uint price;
        OrderType orderType;
        uint timestamp;
        string symbol; 
    }

    Order[] public orders;
    mapping(address => Order[]) public userOrders;

    constructor(address _krwToken, address _btcToken) {
        krwToken = _krwToken;
        btcToken = _btcToken;
    }

    function buyToken(uint amount, uint price, string memory _symbol) external {
        require(amount > 0 && price > 0, "Invalid amount or price");

        uint rawCost = (amount * price) / 1e18;
        uint cost = rawCost / 1e0;

        require(IERC20(krwToken).transferFrom(msg.sender, address(this), cost), "KRW transfer failed");
        require(IERC20(btcToken).transfer(msg.sender, amount), "BTC transfer failed");

        _recordOrder(amount, price, OrderType.BUY, _symbol);
    }

    function sellToken(uint amount, uint price, string memory _symbol) external {
        require(amount > 0 && price > 0, "Invalid amount or price");

        uint rawReward = (amount * price) / 1e18;
        uint reward = rawReward / 1e0;

        require(IERC20(btcToken).transferFrom(msg.sender, address(this), amount), "BTC receive failed");
        require(IERC20(krwToken).transfer(msg.sender, reward), "KRW payout failed");

        _recordOrder(amount, price, OrderType.SELL, _symbol);
    }

    function _recordOrder(uint amount, uint price, OrderType orderType, string memory _symbol) internal {
        Order memory newOrder = Order({
            user: msg.sender,
            amount: amount,
            price: price,
            orderType: orderType,
            timestamp: block.timestamp,
            symbol: _symbol 
        });

        orders.push(newOrder);
        userOrders[msg.sender].push(newOrder);
    }

    function getOrders() external view returns (Order[] memory) {
        return orders;
    }

    function getMyOrders(address user) external view returns (Order[] memory) {
        return userOrders[user];
    }
}
