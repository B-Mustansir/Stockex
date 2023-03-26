// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract StockExchange {
    address public stockTokenAddress;
    address public piTokenAddress;
    uint256 public stockTokenPrice;

    constructor(address _stockTokenAddress, address _piTokenAddress, uint256 _stockTokenPrice) {
        stockTokenAddress = _stockTokenAddress;
        piTokenAddress = _piTokenAddress;
        stockTokenPrice = _stockTokenPrice;
    }

    function buyStockTokens(uint256 _amount) public {
        require(IERC20(piTokenAddress).balanceOf(msg.sender) >= _amount * stockTokenPrice, "Not enough Pi tokens to buy stock tokens");
        require(IERC20(piTokenAddress).allowance(msg.sender, address(this)) >= _amount * stockTokenPrice, "Not enough Pi token allowance");
        IERC20(piTokenAddress).transferFrom(msg.sender, address(this), _amount * stockTokenPrice);
        IERC20(stockTokenAddress).transfer(msg.sender, _amount);
    }

    function sellStockTokens(uint256 _amount) public {
        require(IERC20(stockTokenAddress).balanceOf(msg.sender) >= _amount, "Not enough stock tokens to sell");
        require(IERC20(stockTokenAddress).allowance(msg.sender, address(this)) >= _amount, "Not enough stock token allowance");
        IERC20(stockTokenAddress).transferFrom(msg.sender, address(this), _amount);
        IERC20(piTokenAddress).transfer(msg.sender, _amount * stockTokenPrice);
    }
}
