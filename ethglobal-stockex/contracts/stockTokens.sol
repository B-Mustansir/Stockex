// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "https://github.com/smartcontractkit/chainlink/blob/develop/evm-contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract StockToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    uint256 public stockValue;
    address public owner;
    mapping(address => uint256) public balanceOf;
    AggregatorV3Interface internal priceFeed;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(uint256 _totalSupply, address _priceFeed, string memory _name, string memory _symbol) {
        owner = msg.sender;
        totalSupply = _totalSupply * (10 ** decimals);
        name = _name;
        symbol = _symbol;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function buyStockToken() public payable {
        require(msg.value > 0, "Must send ether to buy tokens");
        uint256 tokensToBuy = (msg.value * totalSupply) / (stockValue * 1 ether);
        require(tokensToBuy <= balanceOf[owner], "Not enough tokens in supply");
        balanceOf[msg.sender] += tokensToBuy;
        balanceOf[owner] -= tokensToBuy;
        emit Transfer(owner, msg.sender, tokensToBuy);
    }

    function sellStockToken(uint256 _amount) public {
        require(_amount > 0, "Must sell at least one token");
        uint256 tokensToSell = (_amount * stockValue * 1 ether) / totalSupply;
        require(tokensToSell <= address(this).balance, "Not enough ether in contract to buy back tokens");
        balanceOf[msg.sender] -= _amount;
        balanceOf[owner] += _amount;
        payable(msg.sender).transfer(tokensToSell);
        emit Transfer(msg.sender, owner, _amount);
    }

    function updateStockValue() public {
        require(msg.sender == owner, "Only owner can update stock value");
        (, int price, , ,) = priceFeed.latestRoundData();
        stockValue = uint256(price);
    }

    function endDay() public {
        require(msg.sender == owner, "Only owner can end day");
        (, int price, , ,) = priceFeed.latestRoundData();
        uint256 difference = (balanceOf[owner] * stockValue) / (1 ether);
        if (difference > 0) {
            uint256 tokensToBuy = (difference * totalSupply) / (stockValue * 1 ether);
            balanceOf[msg.sender] += tokensToBuy;
            balanceOf[owner] -= tokensToBuy;
            emit Transfer(owner, msg.sender, tokensToBuy);
        } else if (difference < 0) {
            uint256 tokensToSell = (-difference * totalSupply) / (stockValue * 1 ether);
            balanceOf[msg.sender] -= tokensToSell;
            balanceOf[owner] += tokensToSell;
            emit Transfer(msg.sender, owner, tokensToSell);
        }
        stockValue = uint256(price);
    }
}
