import Web3 from "web3";
import { abi } from "./StockExchange.json";

const web3 = new Web3(Web3.givenProvider);
const stockExchangeAddress = "0x123abc..."; // replace with the actual address of the deployed smart contract
const stockExchange = new web3.eth.Contract(abi, stockExchangeAddress);

// function to buy stock tokens
async function buyStockTokens(amount) {
  const piTokenAddress = await stockExchange.methods.piTokenAddress().call();
  const stockTokenPrice = await stockExchange.methods.stockTokenPrice().call();
  const requiredPiTokens = amount * stockTokenPrice;

  // check if the user has enough Pi tokens
  const piTokenBalance = await stockExchange.methods.balanceOf(piTokenAddress, web3.eth.defaultAccount).call();
  if (piTokenBalance < requiredPiTokens) {
    throw new Error("Not enough Pi tokens to buy stock tokens");
  }

  // check if the contract has enough stock tokens to sell
  const stockTokenBalance = await stockExchange.methods.balanceOf(stockExchangeAddress, web3.eth.defaultAccount).call();
  if (stockTokenBalance < amount) {
    throw new Error("Not enough stock tokens in the contract");
  }

  // approve the contract to spend Pi tokens on behalf of the user
  await stockExchange.methods.approve(stockExchangeAddress, requiredPiTokens).send({ from: web3.eth.defaultAccount });

  // buy the stock tokens
  await stockExchange.methods.buyStockTokens(amount).send({ from: web3.eth.defaultAccount });
}

// function to sell stock tokens
async function sellStockTokens(amount) {
  const piTokenAddress = await stockExchange.methods.piTokenAddress().call();
  const stockTokenPrice = await stockExchange.methods.stockTokenPrice().call();
  const receivedPiTokens = amount * stockTokenPrice;

  // check if the user has enough stock tokens
  const stockTokenBalance = await stockExchange.methods.balanceOf(stockExchangeAddress, web3.eth.defaultAccount).call();
  if (stockTokenBalance < amount) {
    throw new Error("Not enough stock tokens to sell");
  }

  // approve the contract to spend stock tokens on behalf of the user
  await stockExchange.methods.approve(stockExchangeAddress, amount).send({ from: web3.eth.defaultAccount });

  // sell the stock tokens
  await stockExchange.methods.sellStockTokens(amount).send({ from: web3.eth.defaultAccount });

  // transfer received Pi tokens to the user's account
  await stockExchange.methods.transfer(piTokenAddress, web3.eth.defaultAccount, receivedPiTokens).send({ from: stockExchangeAddress });
}
