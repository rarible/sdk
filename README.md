# Rarible Protocol Software Development Kit

Rarible Protocol SDK enables applications to easily interact with Rarible Protocol: [query](#querying), [issue](#mint), [trade](#sell) NFTs on any blockchain supported.

Currently, these blockchains are supported:

* Ethereum
* Flow
* Tezos
* Polygon

## Installation

Install Protocol SDK:

```shell
yarn add @rarible/sdk -D
yarn add web3@1.5.0
yarn add tslib@2.3.1
```

## Usage

SDK is written in TypeScript. You can use typings to explore SDK possibilities.

### Initialize SDK

```ts
import { createRaribleSdk } from "@rarible/sdk"
```

### Initialize wallets

To use SDK, you have to create a Wallet — abstraction to communicate with real blockchain wallets.
Initialize wallets for used blockchains or use Rarible Wallet Connector (in general for frontend)
It is possible to use sdk without wallet (for ex. sdk.balances.getBalance), but in that case you can't send transactions
and sign messages ()  
```ts
const raribleSdk = createRaribleSdk(undefined, "prod")
```


1. Initialize simple wallets

**Ethereum / Polygon**

You can create EthereumWallet with one of the following providers:
1. Web3 instance
For example: Metamask (window.ethereum), HDWalletProvider (read when using on the backend [instruction](#usage-sdk-on-the-server-backend)) and etc.
2. ethers.providers.Web3Provider
3. ethers.Wallet
```ts
import Web3 from "web3"
import * as HDWalletProvider from "@truffle/hdwallet-provider"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"

//Creating EthereumWallet with Web3
const web3 = new Web3(provider)
const web3Ethereum = new Web3Ethereum({ web3 })
const ethWallet = new EthereumWallet(web3Ethereum)

//or with HDWalletProvider
const provider = new HDWalletProvider({
  url: "<NODE_URL>",
  privateKeys: ["0x0..."],
  chainId: 1,
})
const web3 = new Web3(provider)
const web3Ethereum = new Web3Ethereum({ web3 })
const ethWallet = new EthereumWallet(web3Ethereum)

//Creating EthereumWallet with ethers.providers.Web3Provider
const ethersWeb3Provider = new ethers.providers.Web3Provider(provider)
const ethersProvider = new EthersWeb3ProviderEthereum(ethersWeb3Provider)
const ethWallet = new EthereumWallet(ethersProvider)

//Creating EthereumWallet with ethers.Wallet
const ethersWeb3Provider = new ethers.providers.Web3Provider(provider)
const ethersProvider = new EthersEthereum(new ethers.Wallet(wallet.getPrivateKeyString(), ethersWeb3Provider))
const ethWallet = new EthereumWallet(ethersProvider)
  
// Second parameter — is environment: "prod" | "staging" | "e2e" | "dev"
const raribleSdk = createRaribleSdk(ethWallet, "staging")
```

**Flow**

```ts
import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"

const wallet =  new FlowWallet(fcl)
```

You also need to configure Flow Client Library (FCL) for using Flow. See more information on [Configure fcl](https://docs.rarible.org/flow/flow-sdk/#configure-fcl).

**Tezos**

You can use:
1. in_memory_provider (also for backend)
2. beacon_provider (@rarible/tezos-sdk/dist/providers/beacon/beacon_provider)
3. and etc.
```ts
//in_memory_provider usage example
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"

const provider = in_memory_provider("edsk...", nodeUrl)
const wallet = new TezosWallet(provider)
```

2. Use Rarible SDK Wallet Connector 
[Read more and see code example](https://github.com/rarible/sdk/tree/master/packages/connector#usage-with-rarible-sdk)

With wallet connector make it possible to connect the following providers:
InjectedWeb3ConnectionProvider - metamask, coinbase, etc
FortmaticConnectionProvider
PortisConnectionProvider 
TorusConnectionProvider
WalletLinkConnectionProvider
MEWConnectionProvider
IframeConnectionProvider
WalletConnectConnectionProvider
BeaconConnectionProvider
FclConnectionProvider
 
### Usage SDK on the server (backend)

The SDK was designed for use on the frontend side. To use the SDK on the server side (backend):

1. Install packages:

    ```shell
    yarn add tslib@2.3.1
    yarn add form-data
    yarn add node-fetch
    ```

2. Add dependencies:

    ```typescript
    global.FormData = require("form-data")
    global.window = {
      fetch: require("node-fetch"),
      dispatchEvent: () => {
      },
    }
    global.CustomEvent = function CustomEvent() {
      return
    }
    ```

### Querying

Here are some basic examples of how to use APIs to query data. You can find much more methods in the doc: http://api-dev.rarible.org/v0.1/doc or right in the typescript typings.

```ts

//Fetch items by creator
sdk.apis.item.getItemsByCreator({ creator: someAddress })

//Fetch activity (events) by the Item
sdk.apis.activity.getActivitiesByItem({ type: ["TRANSFER"], contract, tokenId })

//etc. Please explore SDK APIs and openAPI docs
```

### Executing actions

You can use SDK to create(mint), trade, transfer, burn NFTs. All actions are handled in the same manner:
- you invoke function from SDK (e.g.: [mint](#mint))
- async function returns the so-called PrepareResponse (it's different for different actions)
- this PrepareResponse contains all needed information to show the user a form (for example, response for sell contains all supported currency types)
- collect input from the user (show form and let the user enter the data)
- pass this data to submit [Action](https://github.com/rarible/ts-common/tree/master/packages/action)

You can find more information about Action abstraction in the dedicated GitHub readme. Or you can use it as a regular async function and work with regular Promises.

### Create collection

Create NFT collection to mint NFT items on Ethereum, Polygon and Tezos blockchains.
```ts
import { Blockchain } from "@rarible/api-client"
//Address of collection available before approve transaction but you should wait
const { address, tx } = await sdk.nft.deploy({ blockchain, asset })

await tx.wait()
```

### Mint

To mint new item you should specify ID of existed collection or create new one ([create collection](#create-collection))
```ts
//Invoke mint function. It will return a PrepareResponse with some useful information 
const { 
  multiple, // Does the smart contract supports multiple editions or not
  supportsRoyalties, // Does the smart contract supports royalties or not
  supportsLazyMint, // Does the smart contract supports lazy minting or not
  submit //Mint item action
} = await sdk.nft.mint({ collectionId })

//collect information from the user (show the form etc)
//then use submit Action to execute this action

const itemId = await submit({
  uri, // URI of the JSON with NFT metadata (format metadata with sdk.nft.preprocessMeta(...))
  supply, // Amount of the NFT tokens to be minted
  lazyMint, // Minting the NFT token off-chain until the moment it's sold to its first buyer
  creators, // Address of the NFT creator
  royalties, // Royalties from the NFT contract for the creator
})
```

### Sell

First, sell-order should be created:

```ts
//Invoke sell function. It will return a PrepareResponse with some useful information 
const { 
  supportedCurrencies, // list of currency types supported by the blockchain (ETH, ERC20 etc.)
  maxAmount, // max amount of the NFT that can be put on sale
  baseFee, // present it to a user, it's a base protocol fee that is taken on the trade
  submit, // use this Action to submit information after user input
} = await sdk.order.sell({ itemId })

//collect information from the user (show the form etc)
//then use submit Action to execute this action

const orderId = await submit({
  amount, // amount of NFTs to put on sale: must be <= maxAmount
  price, // price of the NFT being sold (0.2 for example if price is 0.2 ETH)
  currency, // curreny (ETH or specific ERC20 or Tez, Flow etc)
  originFees, // optional array of origin fees (TODO add link to origin fees explanation)
  payouts, // optional array of payouts (TODO add link to explanation)
})
```

When the order is created, it's propagated to all Protocol users.
Any app can initiate the process to fill the order ([reference](#fill-orders-buy-or-accept-bid)).

### Bid

A bid is just an unmatched buy order. The bidder submits the order to the indexer. The seller accepts it by creating a matched order.

```ts
//Invoke bid function. It will return a PrepareResponse with some useful information 
const { 
  supportedCurrencies, // list of currency types supported by the blockchain (ETH, ERC20 etc.)
  multiple, // does the smart contract supports multiple editions or not
  maxAmount, // max amount of the NFT that can be put on sale
  baseFee, // present it to a user, it's a base protocol fee that is taken on the trade
  submit, // use this Action to submit information after user input
  getConvertableValue // see description below
} = await sdk.order.bid({ itemId })

/*
  Get the value of the native token that will be converted if you use a wrapped token (Wrapped Ether for Ethereum, wXTZ for Tezos, etc.) to place a bid
  Example of returned values, when passed wrapped token contract:
  1. Returns "undefined" if you have sufficient funds to make a bid
  2. Returns if needed to convert funds to wrapped token (ex. Wrapped Ether).
  The value will be converted automatically after invoking the "submit" function. Convertable value also includes origin fees
  {
    type: "convertable",
    currency: { '@type': 'ETH' },
    value: BigNumber {...}
  }
  3. Returns if native token funds is insufficient for convert operation
  {
    type: "insufficient",
    currency: { '@type': 'ETH' },
    value: BigNumber {...}
  }
  The Result of invoking getConvertableValue function is always undefined if you pass a non-wrapped token contract because converting of non-wrapped tokens is not supported.
 */
getConvertableValue({
  assetType: { "@type": "ERC20", contract: wethContract }, // payment asset
  price: "0.00000001", // price per 1 NFT
  amount: 4, // amount of NFTs to bid (total needed value for bid calculated as price * amount)
  originFees: [{
    account: feeAccount,
    value: 250, // fee percent in range 0-10000, where 0 - 0%, 250 - 2,5%, 5000 - 50%, 10000 - 100% 
  }], // origin fees, by default []
})

//collect information from the user (show the form etc.)
//then use submit Action to execute this action

const orderId = await submit({
  amount, // amount of NFTs to put on sale: must be <= maxAmount
  price, // price of the NFT being sold (0.2 for example if price is 0.2 ETH)
  currency, // curreny (ETH or specific ERC20 or Tez, Flow etc)
  originFees, // optional array of origin fees (TODO add link to origin fees explanation)
  payouts, // optional array of payouts (TODO add link to explanation)
})
```

### Fill orders (buy or accept bid)

When the order is created, it's propagated to all Protocol users.
Any app can initiate the process to fill the order.

Use `sdk.order.buy()` method to buy NFT with orderId and `sdk.order.acceptBid()` methods to fill bid order.

```ts
const {
  maxAmount, // max amount of NFTs available for purchase
  baseFee, // fee that will be taken from the buyer
  originFeeSupport, // if smart contract supports custom origin fees
  payoutsSupport, // if smart contract supports payouts
  supportsPartialFill, // if smart contract supports partial fills 
} = await sdk.order.buy({ orderId })

//collect information from the user 
//then submit

const tx = await submit({
  amount, // amount to buy
  originFees, // optional origin fees (TODO add link to explanation)
  payouts, // optional payouts (TODO add link)
  infiniteApproval, // if sdk should use infinite approval (usually applicable for ERC-20)
})
```

After the call submits action, you will get IBlockchainTransaction object which can be used to watch for transaction status (error or confirmed).

### Transfer

```ts
//Invoke transfer function. It will return a PrepareResponse with some useful information 
const { 
  multiple, // Does the smart contract supports multiple editions or not
  maxAmount, // Max amount of NFTs available for transfer
} = await sdk.order.transfer({ itemId })

//collect information from the user (show the form etc.)
//then use submit Action to execute this action

const tx = await submit({
  to, // Recipient NFT address
  amount, // Amount of NFTs to transfer
})
```

### Burn

```ts
//Invoke burn function. It will return a PrepareResponse with some useful information 
const { 
  multiple, // Does the smart contract supports multiple editions or not
  maxAmount, // Max amount of NFTs available for burn
} = await sdk.order.burn({ itemId })

//collect information from the user (show the form etc.)
//then use submit Action to execute this action

const tx = await submit({
  amount, // Amount of NFTs to burn
})

//you should wait transaction if your item is on-chain
//and tx is undefined when your item was lazy-minted
if (tx) {
  await tx.wait()
}
```


### Convert to/from wrapped fungible tokens (ex. eth<->weth, xtz<->wTez)
```ts
import { Blockchain } from "@rarible/api-client"
//Convert 0.1 ETH to 0.1 wETH (Wrapped Ether)
const tx = await sdk.balances.convert(Blockchain.ETHEREUM, true, "0.1")
await tx.wait()

//Or unwrap 0.1 wETH to 0.1 ETH
const tx = await sdk.balances.convert(Blockchain.ETHEREUM, false, "0.1")
await tx.wait()
```

### Get balance of fungible tokens

```ts
import { toContractAddress, toUnionAddress } from "@rarible/types";
import { Blockchain } from "@rarible/api-client";

const walletAddress = toUnionAddress("ETHEREUM:0x...")
//Get balance of ethereum wallet
const ethBalance = await sdk.balances.getBalance(walletAddress, {
  "@type": "ETH"
})

//Get balance of polygon wallet
const polygonBalance = await sdk.balances.getBalance(walletAddress, {
  "@type": "ETH",
  blockchain: Blockchain.POLYGON,
})

//Get wallet balance of erc20 contract
const erc20Balance = await sdk.balances.getBalance(walletAddress, {
  "@type": "ERC20",
  contract: toContractAddress("ETHEREUM:0x...")
})
```
"getBalance" method is not supports balance of NFT-tokens

### Note

*This is a pre-release version. Backward compatibility is not fully supported before 1.0 release. Backward compatibility is only guaranteed in minor releases.*

*For example, 0.2.x version may not be compatible with 0.1.x. So, it's advised to include dependencies using package versions (ex. rarible/sdk@0.2.x).*
