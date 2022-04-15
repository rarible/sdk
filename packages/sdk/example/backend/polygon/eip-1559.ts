const ethers = require("ethers");

const privateKey = ""
const wallet = new ethers.Wallet(privateKey);

const address = wallet.address;
console.log("Public Address:", address);

const httpsUrl = "https://polygon-rpc.com";
console.log("HTTPS Target", httpsUrl);

const init = async function () {
  const httpsProvider = new ethers.providers.JsonRpcProvider(httpsUrl);

  let nonce = await httpsProvider.getTransactionCount(address);
  console.log("Nonce:", nonce);

  let feeData = await httpsProvider.getFeeData();
  console.log("Fee Data:", feeData);

  const tx = {
    type: 2,
    nonce: nonce,
    to: "<RECEIVER_ADDRESS>", // Address to send to
    maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"], // Recommended maxPriorityFeePerGas
    maxFeePerGas: feeData["maxFeePerGas"], // Recommended maxFeePerGas
    value: ethers.utils.parseEther("0.000000000001"), // .01 ETH
    gasLimit: "1000000", // basic transaction costs exactly 21000
    chainId: 137, // Ethereum network id
  };
  console.log("Transaction Data:", tx);

  const signedTx = await wallet.signTransaction(tx);
  console.log("Signed Transaction:", signedTx);

  const txHash = ethers.utils.keccak256(signedTx);
  console.log("Precomputed txHash:", txHash);
  console.log(`https://kovan.etherscan.io/tx/${txHash}`);

  httpsProvider.sendTransaction(signedTx).then(console.log);

};

init();
