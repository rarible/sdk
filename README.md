## Rarible Protocol Software Development Kit

Rarible Protocol SDK enables applications to easily interact with Rarible protocol: [query](#querying), [issue](#mint), [trade](#sell) NFTs on any blockchain supported.

Currently, these blockchains are supported:
- Ethereum (rinkeby, mainnet)
- Flow (currently on devnet only)
- Tezos (on granada testnet)

## Installation
```angular2html
npm install -D @rarible/sdk
```
## Usage

SDK is written in typescript, you can use typings to explore SDK possibilties.

To use SDK, first you have to create a Wallet - abstraction to communicate with real blockchain wallets:

```ts
//initialize ethereum wallet
import { EthereumWallet } from "@rarible/sdk-wallet"

const ethereum = new Web3Ethereum({ web3, from })
const ethereumWallet = new EthereumWallet(ethereum, from) 
```

```ts
//WIP: how to initialize Tezos and Flow wallets
```

```ts
//initialize sdk

import { createRaribleSdk } from "@rarible/sdk"

//wallet - created before
//second parameter - is environment: "prod" | "staging" | "e2e" | "dev"
const sdk = createRaribleSdk(wallet, "prod")
```

### Querying

Here are some basic examples of how to use APIs to query data. You can find much more methods in the doc: http://api-dev.rarible.org/v0.1/doc or right in the typescript typings. 

```ts

//Fetch items by creator
sdk.apis.item.getItemsByCreator({ creator: someAddress })

//Fetch activity (events) by the Item
sdk.apis.activity.getActivitiesByItem({ type: ["TRANSFER"], contract, tokenId })

//etc... pls explore SDK apis and openapi docs
```

### Executing actions

You can use SDK to create(mint), trade, transfer, burn NFTs. All actions are handled in the same manner:
- you invoke function from SDK (e.g.: [mint](#creating-nfts-minting))
- async function returns so-called PrepareResponse (it's different for different actions)
- this PrepareResponse contains all needed information to show user a form (for example, response for sell contains all supported currency types)
- collect input from the user (show form and let user enter the data)
- pass this data to submit [Action](https://github.com/rarible/ts-common/packages/action)

You can find more information about Action abstraction in dedicated github readme. Or you can use it as a regular async function and work with regular Promises.

### Mint

TODO

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

When order is created, it's propagated to all users of the Protocol.
Any app can initiate process to fill the order.

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

After call submit action, you will get IBlockchainTransaction object which can be used to watch for transaction status (error or confirmed).


### Bid

TODO

### Transfer

TODO

### Burn

TODO

### Note

*This is a pre-release version. Backward compatibility is not fully supported before 1.0 release. Backward compatibility is only guaranteed in minor releases.*

*For example, 0.2.x version may not be compatible with 0.1.x. So, it's advised to include dependencies using package versions (ex. rarible/sdk@0.2.x).*

### Additional Resource

To quickly get up and running with the SDK fork this repo which includes all dependencies to use the SDK: [SDK-Template](https://github.com/kolberszymon/union-sdk-template)  