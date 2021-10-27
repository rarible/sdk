## Rarible Protocol Software Development Kit

Rarible Protocol SDK enables applications to easily interact with Rarible protocol: [query](#querying), issue, [trade](#trading) NFTs on any blockchain supported.

Currently, these blockchains are supported:
- Ethereum
- Flow (on devnet)
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
import { EthereumWallet } from "@rarible/sdk-wallet/src"

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

```

### Trading

```ts
//Putting Item on sale

//First, invoke sell function. It will return an object with some useful information 
const { 
  supportedCurrencies, // list of currencies supported by specific blockchain (ETH, ERC20 etc.)
  maxAmount, // max amount of the NFT that can be put on sale; you can validate the input from use using this value
  baseFee, // present it to a user, it's a base protocol fee that is taken on the trade
  submit, // use this Action to submit information after user input
} = await sdk.order.sell({ itemId })

//collect information from the user (show the form etc)
//then use submit Action to execute this action

submit({
  amount, // amount of NFTs to put on sale: must be <= maxAmount
})

```
