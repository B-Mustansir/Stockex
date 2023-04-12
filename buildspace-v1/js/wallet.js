// Connecting metamask on price-details page
async function getAccount() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    document.getElementById("signIn").innerHTML = account;
}

// Connecting metamask on wallet page
async function getMetamaskAccount() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    document.getElementById("metamask-address").innerHTML = account;
}

// Connecting coinbase on wallet page

// // Use eth_requestAccounts
// ethereum.request({ method: 'eth_requestAccounts' }).then(response => {
//     const accounts : string[] = response as string[];
//     console.log(`User's address is ${accounts[0]}`)
  
//     // Optionally, have the default account set for web3.js
//     web3.eth.defaultAccount = accounts[0]
//   })
  
//   // Alternatively, you can use ethereum.enable()
//   ethereum.enable().then((accounts: string[]) => {
//     console.log(`User's address is ${accounts[0]}`)
//     web3.eth.defaultAccount = accounts[0]
//   })

// Connecting Intmax on wallet page
import IntmaxWalletSigner from "webmax/dist/signer.js" ;

async function getIntmaxWallet(){
  const signer = new IntmaxWalletSigner();
  const account = await signer.connectToAccount();
}

// https://www.learningsomethingnew.com/embed-react-in-vanilla-js-website

