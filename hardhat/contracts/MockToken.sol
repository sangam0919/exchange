// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    address public admin;
    mapping(address => bool) public claimed;

    constructor(uint256 initialSupply) ERC20("MockToken", "MTK") {
        admin = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function adminClaimTo(address to) external onlyAdmin {
        require(!claimed[to], "Already claimed");
        claimed[to] = true;
        _mint(to, 1000000 * 1e18);
    }

        // 스마트계정이 직접 실행할 때 사용하는 함수
    function claim() external {
        require(!claimed[msg.sender], "Already claimed");
        claimed[msg.sender] = true;
        _mint(msg.sender, 1000000 * 1e18);
    }
}
