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
yarn add web3
```

Install SDK Wallet Connector:

```shell
yarn add @rarible/connector
# optional: add additional connectors
yarn add @rarible/connector-walletconnect
yarn add @rarible/connector-fortmatic
# check other @rarible/connector-* packages to see what's supported 
```

## Usage

SDK is written in TypeScript. You can use typings to explore SDK possibilities.

### Initialize SDK

```ts
import { createRaribleSdk } from "@rarible/sdk"
import { Blockchain } from "@rarible/api-client"
```

### Initialize wallets

To use SDK, you have to create a Wallet — abstraction to communicate with real blockchain wallets.

1. Use Rarible SDK Wallet Connector

Create `Connector`, add all needed `ConnectionProvider's`

```ts
import { Connector, InjectedWeb3ConnectionProvider, DappType } from "@rarible/connector"
import { WalletConnectConnectionProvider } from "@rarible/connector-walletconnect"

// create providers with the required options
const injected = new InjectedWeb3ConnectionProvider()
const walletConnect = new WalletConnectConnectionProvider()
	
// create connector and push providers to it 
const connector = Connector
    .create([injected, walletConnect])
		
// subscribe to connection status
connector.connection.subscribe((con) =>
    console.log("connection: " + JSON.stringify(con))
)

const options = await connector.getOptions(); // get list of available option
await connector.connect(options[0]); // connect to selected provider
```

2. Initialize wallets

See [code example](https://github.com/rarible/sdk/tree/master/packages/connector#usage-with-rarible-sdk) in the repository for initialize wallets with Wallet Connector.

**Ethereum / Polygon**

```ts
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"

const web3 = new Web3(provider)
const web3Ethereum = new Web3Ethereum({ web3 })
const ethWallet = new EthereumWallet(web3Ethereum)

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

Use [Wallet Connector](https://github.com/rarible/sdk/tree/master/packages/connector#usage-with-rarible-sdk) to initialize wallet for Tezos.

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

### Mint

```ts
//Invoke mint function. It will return a PrepareResponse with some useful information 
const { 
  multiple, // Does the smart contract supports multiple editions or not
  supportsRoyalties, // Does the smart contract supports royalties or not
  supportsLazyMint, // Does the smart contract supports lazy minting or not
} = await sdk.order.mint({ itemId })

//collect information from the user (show the form etc)
//then use submit Action to execute this action

const orderId = await submit({
  collection, // Information about the NFT collection (id, type, name, etc.)
  uri, // URI of the NFT token
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
Any app can initiate the process to fill the order.

```ts
const {
  maxAmount, // max amount of NFTs available for purchase
  baseFee, // fee that will be taken from the buyer
  originFeeSupport, // if smart contract supports custom origin fees
  payoutsSupport, // if smart contract supports payouts
  supportsPartialFill, // if smart contract supports partial fills 
} = await sdk.order.fill({ order }) //you can also use orderId if you don't have order

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

Use `sdk.order.buy()` or `sdk.order.acceptBid()` methods to fill sell or bid orders.

```ts
const {
  maxAmount, // max amount of NFTs available for purchase
  baseFee, // fee that will be taken from the buyer
  originFeeSupport, // if smart contract supports custom origin fees
  payoutsSupport, // if smart contract supports payouts
  supportsPartialFill, // if smart contract supports partial fills 
} = await sdk.order.buy({ order }) //you can also use orderId if you don't have order

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

const orderId = await submit({
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

const orderId = await submit({
  amount, // Amount of NFTs to burn
})
```

### Note

*This is a pre-release version. Backward compatibility is not fully supported before 1.0 release. Backward compatibility is only guaranteed in minor releases.*

*For example, 0.2.x version may not be compatible with 0.1.x. So, it's advised to include dependencies using package versions (ex. rarible/sdk@0.2.x).*
