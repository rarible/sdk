# Rarible Transaction Builder Backend

Rarible Transaction Builder Backend is a Node.JS server that helps to get buy transaction the same as can be got by SDK.

Start Node.JS http serve with Docker or by manual starting:

1. Docker image:

```shell
docker build -t rarible-tx-builder .
docker run -it -e RPC_URL="https://mainnet.infura.io/v3/<API_KEY>" -e SDK_ENV="prod" -p 3000:3000 rarible-tx-builder
```
Where
**RPC_URL** - RPC Node url from your network (for ex. **_https://mainnet.infura.io/v3/<API_KEY>_**)
**SDK_ENV** - SDK environment (for ex. **_prod_**, [read more](https://github.com/rarible/ethereum-sdk))

or

2. Manual starting:

Create **.env** file in project directory with
```text
RPC_URL=https://mainnet.infura.io/v3/<API_KEY>
SDK_ENV=prod
```

And start from terminal
```shell
yarn install
yarn build
yarn start
```

Now server is available on http://localhost:3000


Send post your buy request the same as [purchase ethereum-sdk request](https://github.com/rarible/ethereum-sdk#purchase-order-or-accept-bid)
```shell
const buyerAddress = "0x..."
const buyerPrivateKey = "..."
//Get transaction data
const { data } = await axios.post("http://localhost:3000", {
  //Your ethereum address
  from: buyerAddress,
  request: {
    //Order id from rarible protocol
    orderId: "0x",
    amount: 1,
    originFees: [...],
    payouts: [...],
  },
})

const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/<API_KEY>"))
const buyerNonce = await web3.eth.getTransactionCount(buyerAddress, "latest") // nonce starts counting from 0
const buyerTxData = {
  ...data,
  nonce: buyerNonce,
}
//Sign transaction
const signedBuyerTx = await web3Buyer.eth.accounts.signTransaction(buyerTxData, buyerPrivateKey)
//Send signed transaction
await web3Buyer.eth.sendSignedTransaction(signedBuyerTx.rawTransaction)
//Goal!
```
