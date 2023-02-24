# Rarible Protocol Software Development Kit

Rarible Multichain Protocol is a decentralized toolset that simplifies the way developers can work with NFTs. The protocol builds an abstraction layer for several blockchains and isolates the developer from their specifics with a Multichain SDK.

Rarible Multichain SDK is fully blockchain-agnostic. You can find a list of supported blockchains on our [Features](https://docs.rarible.org/features/) page.

We use different environments for blockchain networks. See actual information on [API Reference](https://docs.rarible.org/api-reference/) page.

Rarible Multichain SDK enables applications to easily interact with Rarible Protocol: query, issue and trade NFTs on any blockchain supported. See more information on our documentation [Reference](https://docs.rarible.org/reference/reference-overview/) section.

- [Example frontend app](#example-frontend-application)
- [Installation](#installation)
  - [Creating SDK with Ethereum providers](#ethereum-providers) 
    - [Web3](#web3) 
    - [Ethers.js](#ethers)
  - [Creating SDK with Flow provider](#flow-providers) 
  - [Creating SDK with Solana provider](#solana-provider) 
  - [Creating SDK with Tezos providers](#tezos-providers)
  - [Creating SDK with ImmutableX provider](#immutablex-provider)
  - [Creating SDK with connectors](#use-rarible-sdk-wallet-connector)
- [Methods](#methods)
  - [About advanced methods calls](#about-advanced-methods-calls)
  - [Create collection](#create-collection)
  - [Mint](#mint)
  - [Transfer](#transfer)
  - [Burn](#burn)
  - [Sell](#sell)
  - [Buy](#buy)
  - [Bid](#bid)
  - [Accept bid](#accept-bid)
  - [Update sell order](#update-sell-order)
  - [Update bid order](#update-bid-order)
  - [Cancel sell/bid order](#cancel-sellbid-order)
  - [Checking balance](#check-balance)
- [Using SDK on server application](#using-sdk-on-server-application)
- [API](#api-querying)
- [Troubleshooting](#troubleshooting)

## Example frontend application 
See our example how it works:
1. Clone repository
2. Install dependencies and build sdk. Execute in the root folder:

> **Note:** on Apple silicon, you have to run NodeJS in `x64` mode. You'll see [this issue otherwise](https://github.com/rarible/sdk/issues/402). Follow [these steps to solve](https://stackoverflow.com/a/67907214/861773).

    ```shell
    yarn && yarn bootstrap && yarn build-all
    ```

3. Start the application in development mode:

    ```shell
    cd packages/example
    yarn start
    ```

The application is available at [http://localhost:3000](http://localhost:3000)
4. Click on "Connect" in left menu and choose your wallet (in selected environment).
5. Check SDK methods!

You also can find **Typescript (.ts)** [`examples in that folder`](https://github.com/rarible/sdk/tree/master/packages/sdk-examples/src) for the frontend and backend side

## Installation

Install Protocol SDK:

```shell
yarn add @rarible/sdk
yarn add tslib@2.3.1
yarn add web3@1.5.0 //or ethers@5.6.2
```

### Ethereum providers
#### Web3
Example of using Metamask provider ([read more about using provider](https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider))
```ts
const blockchainProvider = new Web3(window.ethereum)
const raribleSdk = createRaribleSdk(blockchainProvider, "testnet") //"prod" | "testnet" | "development"
```

#### Ethers
```ts
//read-only provider, not for sending transactions!
const blockchainProvider = new ethers.Wallet(pk, new ethers.providers.JsonRpcProvider("https://NODE_URL"))
const raribleSdk = createRaribleSdk(blockchainProvider, "testnet")
```

### Flow providers
Fcl provider for Flow
```ts
import * as fcl from "@onflow/fcl"
fcl.config({
  "accessNode.api": "https://access-testnet.onflow.org", // Mainnet: "https://access-mainnet-beta.onflow.org"
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn" // Mainnet: "https://fcl-discovery.onflow.org/authn"
})
const raribleSdk = createRaribleSdk(fcl, "testnet")
```

### Solana provider
* Solana provider interface with `publicKey` field and `signTransaction`, `signAllTransactions` methods
```ts
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
const blockchainProvider = SolanaKeypairWallet.createFrom(pk)
const raribleSdk = createRaribleSdk(blockchainProvider, "testnet")
```

### Tezos providers
* Tezos provider like in_memory_provider (@rarible/tezos-sdk), Beacon ([source](https://github.com/rarible/tezos-sdk/blob/master/packages/sdk/providers/beacon/beacon_provider.ts)) or etc.
```ts
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
const blockchainProvider = in_memory_provider(edsk, "https://TEZOS_NODE_URL")
const raribleSdk = createRaribleSdk(blockchainProvider, "testnet")
```

### ImmutableX provider
```ts
import { ImxWallet } from "@rarible/immutable-wallet"
const imxConnectorWallet = new ImxWallet("prod")
await imxConnectorWallet.connect()
const raribleSdk = createRaribleSdk(imxConnectorWallet, "prod")
```

### Use Rarible SDK Wallet Connector

Wallet Connector make possible to connect the following providers:

* InjectedWeb3ConnectionProvider — Metamask, Coinbase, etc
* FortmaticConnectionProvider
* PortisConnectionProvider
* TorusConnectionProvider
* WalletLinkConnectionProvider
* MEWConnectionProvider
* IframeConnectionProvider
* WalletConnectConnectionProvider
* BeaconConnectionProvider
* FclConnectionProvider

[Read more](https://github.com/rarible/sdk/tree/master/packages/connector) about installation and using examples of Rarible SDK Wallet Connector. 
Connectors are used in [Frontend example app](https://github.com/rarible/sdk/tree/master/packages/example)

## Methods
_When you initialized Rarible SDK with required provider ([see Installation section](#installation)) it's ready for using._

### About advanced methods calls
Most methods have two ways to call, simple and advanced. The advanced methods consists of two stages: preparation and submit, and gives more information and control to complete the transaction.
Example of sell NFT with simple and advanced ways:
```ts
// Simple
const orderId = await sdk.order.sell({
  itemId: toItemId("ETHEREUM:0x64f088254d7ede5dd6208639aabf3614c80d396d:108764404607684442395098549286597885532295288457125436143364084161803586633729"),
  amount: 1,
  price: "0.1",
  currency: {
    "@type": "ERC20",
    contract: toContractAddress("ETHEREUM:0x9f853f3B6a9dD425F8Cf73eF5B90e8eBf412317b"),
  }
})
```
or
```ts
// Advanced
const {
  originFeeSupport, // Whether the underlying exchange contract supports origin fees
  payoutsSupport, // Whether the underlying exchange contract supports specifying payouts
  supportedCurrencies, // Currencies supported by the blockchain
  baseFee, // Protocol base fee in basis points
  supportsExpirationDate, // Whether the expiration date
  submit
} = await sdk.order.sell.prepare({
  itemId: toItemId("ETHEREUM:0x64f088254d7ede5dd6208639aabf3614c80d396d:108764404607684442395098549286597885532295288457125436143364084161803586633729"),
})

// `prepare` returns `submit` method and some usefull data like available features for this call for this blockchain/collection/item

const orderId = await submit({
  amount: 1,
  price: "0.1",
  currency: {
    "@type": "ERC20",
    contract: toContractAddress("ETHEREUM:0x9f853f3B6a9dD425F8Cf73eF5B90e8eBf412317b"),
  },
})

```


### Create Collection

Before minting an NFT you might want to prepare collection for it.

#### Ethereum
```typescript
const { address, tx } = await sdk.nft.createCollection({
    blockchain: Blockchain.ETHEREUM,
    type: "ERC721",
    name: "name",
    symbol: "RARI",
    baseURI: "https://ipfs.rarible.com",
    contractURI: "https://ipfs.rarible.com",
    isPublic: true,
})
```

#### Solana
```typescript
const { address, tx } = await sdk.nft.createCollection({
    blockchain: Blockchain.SOLANA,
    metadataURI: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
})
```
More information about [solana metadata format](https://docs.metaplex.com/architecture/deep_dive/overview#uri-json-schema)

#### Tezos
```typescript
const { address, tx } = await sdk.nft.createCollection({
    blockchain: Blockchain.TEZOS,
    type: "NFT",
    name: "My NFT collection",
    symbol: "MYNFT",
    contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
    isPublic: true,
})
```

### Mint

#### Ethereum

```typescript
const { transaction, itemId } = await sdk.nft.mint({
    uri: "ipfs://IPFS_METADATA_URI",
    collectionId: toCollectionId("ETHEREUM:0x..."),
})
const { hash, blockchain } = await transaction.wait()
```

#### Solana
```ts
const { transaction, itemId } = await sdk.nft.mint({
  collectionId: toCollectionId("SOLANA:..."),
  uri: "https://SOLANA_METADATA_URI",
})
const { hash, blockchain } = await transaction.wait()
```

#### Tezos
```ts
const { transaction, itemId } = await sdk.nft.mint({
  collectionId: toCollectionId("TEZOS:..."),
  uri: "ipfs://TEZOS_IPFS_METADATA_URI",
  supply: 12,
  royalties: [{
    account: toUnionAddress("TEZOS:..."),
    value: 1000,
  }],
  creators: [{
    account: toUnionAddress("TEZOS:..."),
    value: 10000,
  }],
})
const { hash, blockchain } = await transaction.wait()
```

#### Flow
```ts
const { itemId, transaction } = await sdk.nft.mint({
  collectionId: toCollectionId("FLOW:..."),
  uri: "https://FLOW_METADATA_URI",
})
const { hash, blockchain } = await transaction.wait()
```

> *Notice:* this method has an advanced call `sdk.nft.mint.prepare(...)`
```ts
const {
  multiple, // it's multiple collection, like ERC-1155, TEZOS-MT and etc.
  supportsRoyalties,
  supportsLazyMint,
  submit
} = await sdk.nft.mint.prepare({
  collectionId: toCollectionId("TEZOS:..."),
})
const mintResult = await submit({
  uri: "ipfs://IPFS_METADATA_URI",
  supply: 1,
  creators: [{
    account: sender,
    value: 10000,
  }],
  royalties: [],
  lazyMint: false,
})
if (mintResult.type === MintType.ON_CHAIN) {
  const transaction = await mintResult.transaction.wait()
  console.log("minted item id:", mintResult.itemId)
}
```

### Transfer

Transfer token to another wallet.

```ts
const tx = await sdk.nft.transfer({
  itemId: toItemId("YOUR_ITEM_ID"),
  to: toUnionAddress("DESTINATION_WALLET_ADDRESS"),
  amount: 1,
})
await tx.wait()
```

> *Notice:* this method has an advanced call `sdk.nft.transfer.prepare(...)`
```ts
const {
  submit,
  maxAmount, // max amount of NFT
  multiple, // it's multiple token, like ERC-1155, TEZOS-MT and etc.
} = await sdk.nft.transfer.prepare({
  itemId: toItemId("YOUR_ITEM_ID"),
})
const tx = await submit({
  to: toUnionAddress("DESTINATION_WALLET_ADDRESS"),
  amount: 1,
})
await tx.wait()
```

### Burn

Burning an NFT

```typescript
const tx = await sdk.nft.burn({
    itemId: toItemId("YOUR_ITEM_ID"),
    amount: 1,
})
//tx can be undefined if burned item is lazy-minted
if (tx) {
  await tx.wait()
}
```

> *Notice:* this method has an advanced call `sdk.nft.burn.prepare(...)`
```typescript
const {
  submit,
  multiple, // it's multiple token, like ERC-1155, TEZOS-MT and etc.
  maxAmount, // max amount of NFT
} = await sdk.nft.burn.prepare({
  itemId: toItemId("YOUR_ITEM_ID"),
})
const tx = await submit({ amount: 1})
//tx can be undefined if burned item is lazy-minted
if (tx) {
  await tx.wait()
}
```

### Sell

Selling NFT

```typescript
const orderId = await sdk.order.sell({
    itemId: toItemId("YOUR_ITEM_ID"),
    amount: 1,
    price: "0.01",
    currency: toCurrencyId("ETHEREUM:..."),
})
```

> *Notice:* this method has an advanced call `sdk.order.sell.prepare(...)`
```ts
const {
  submit,
  originFeeSupport,
  payoutsSupport,
  supportedCurrencies,
  baseFee,
  supportsExpirationDate,
} = await sdk.order.sell({ itemId: toItemId("YOUR_ITEM_ID") })

const orderId = await submit({
  amount: 1,
  price: "0.01",
  currency: toCurrencyId("ETHEREUM:..."),
})
```

### Buy

Buy NFT using sell order

```typescript
const tx = await sdk.order.buy({
    order: toOrderId("..."),
    amount: 1,
})
await tx.wait()
```
> *Notice:* this method has an advanced call `sdk.order.buy.prepare(...)`
```ts
const {
  submit,
  maxAmount,
  baseFee,
  originFeeSupport,
  payoutsSupport,
  supportsPartialFill
} = await sdk.order.buy.prepare({ order: toOrderId("...") })
await tx.wait()
```

### Bid

Place bid order for an NFT

```typescript
const orderId = await sdk.order.bid({
  itemId: toItemId("..."),
  amount: 1,
  price,
  currency: { "@type": "ETH" },
})
```
> *Notice:* this method has an advanced call `sdk.order.bid.prepare(...)`
```ts
const {
  submit,
  originFeeSupport,
  payoutsSupport,
  supportedCurrencies,
  multiple,
  maxAmount,
  baseFee,
  getConvertableValue,
  supportsExpirationDate,
} = await sdk.order.bid.prepare({ itemId: toItemId("...") })

const tx = await submit({
  amount: 1,
  price: "0.01",
  currency: { "@type": "ETH" },
})
await tx.wait()
```

### Accept Bid

Accept bid request using bid order

```typescript
const acceptBidTx = await sdk.order.acceptBid({
    orderId: toOrderId("..."),
    amount: 1,
})
await acceptBidTx.wait()
```

> *Notice:* this method has an advanced call `sdk.order.acceptBid.prepare(...)`
```typescript
const {
  submit,
  maxAmount,
  baseFee,
  originFeeSupport,
  payoutsSupport,
  supportsPartialFill
} = await sdk.order.acceptBid.prepare({
    orderId: toOrderId("..."),
})
const tx = await submit({ amount: 1 })
await tx.wait()
```

### Update Sell Order

Update price for given sell order

```typescript
const orderId = sdk.order.sellUpdate({
    orderId: toOrderId("..."),
    price: "0.2",
})
```
> *Notice:* this method has an advanced call `sdk.order.sellUpdate.prepare(..)`
```typescript
const {
  submit,
} = sdk.order.sellUpdate.prepare({
    orderId: toOrderId("..."),
})
const updatedOrderId = await submit({ price: "0.2" })
```

### Update Bid Order

Update price for given bid order

```typescript
const orderId = sdk.order.bidUpdate({
    orderId: toOrderId("..."),
    price: "0.2",
})
```
> *Notice:* this method has an advanced call `sdk.order.bidUpdate.prepare()`
```ts
const {
  submit,
  originFeeSupport,
  payoutsSupport,
  supportedCurrencies,
  baseFee
} = sdk.order.bidUpdate.prepare({ orderId: toOrderId("...") })
const updatedOrderid = await submit({ price: "0.2" })
```
### Cancel Sell/Bid order

```typescript
const tx = await sdk.order.cancel({ orderId: toOrderId("...") })
await tx.wait()
```

### Check Balance

Get native currency, tokens or NFT balance

```ts
// get balance for native currency
const balance = await sdk.balances.getBalance(
  toUnionAddress("ETHEREUM:..."),
  { "@type": "ETH" }
)

// get balance for ntf/tokens
const balanceTokens = await sdk.balances.getBalance(
  toUnionAddress("SOLANA:2XyukL1KvwDkfNcdBpfXbj6UtPqF7zcUdTDURNjLFAMo"), // wallet address
  toCurrencyId("SOLANA:9bDqoTDNmjA3m9sFYBNj5pPWpsjKXa23V7mCW6gA74Vy") // contract/token address
)
```

### Check Bidding Balance

Get balance used for complete bids

```ts
sdk.balances.getBiddingBalance({
  currency: { "@type": "SOLANA_SOL" },
  walletAddress: toUnionAddress("SOLANA:..."),
})
```

### Deposit Bidding Balance

Deposit bidding balance

```ts
const tx = await sdk.balances.depositBiddingBalance({
  currency: { "@type": "SOLANA_SOL" },
  amount: 0.01,
})
```

### Withdraw Bidding Balance

Withdraw from bidding balance

```ts
const tx = await sdk.balances.withdrawBiddingBalance({
  currency: { "@type": "SOLANA_SOL" },
  amount: 0.01,
})
```






## Using SDK on server application

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

3. Try our [example](https://github.com/rarible/sdk/blob/master/packages/sdk-examples/src/backend/ethereum/buy.ts) to buy Ethereum NFT item on Rinkeby network:

   Pass private key, node RPC URL, network ID, item ID for buyout and start:

    ```shell
    ETH_PRIVATE_KEY="0x..." \
    ETHEREUM_RPC_URL="https://rinkeby.infura.io/..." \
    ETHEREUM_NETWORK_ID="4" \
    BUYOUT_ITEM_ID="0x1AF7A7555263F275433c6Bb0b8FdCD231F89B1D7:102581254137174039089845694331937600507918590364933200920056519678660477714440" \
    ts-node packages/sdk-examples/src/backend/ethereum/buy.ts
    ```

## API (Querying)

Here are some basic examples of how to use APIs to query data. You can find much more methods in the doc: [https://multichain.redoc.ly/](https://multichain.redoc.ly/) or right in the typescript typings.

For using API with api key you should pass:
```ts
const raribleSdk = createRaribleSdk(provider, "testnet", {
  apiKey: "$API_KEY"
}) //"prod" | "testnet" | "development"
```

```ts
//Fetch items by creator
sdk.apis.item.getItemsByCreator({ creator: someAddress })

//Fetch activity (events) by the Item
sdk.apis.activity.getActivitiesByItem({ type: ["TRANSFER"], contract, tokenId })

//etc. Please explore SDK APIs and openAPI docs
```
**NOTE:** Our indexer can scanning blockchains with a slight delay. If your code depends on API data you should awaiting that until it appears.     
```ts
//Don't do like that!
const { address, tx } = await sdk.nft.createCollection({...})
//If collection still not indexed you will get error
const collection = await sdk.apis.collection.getCollectionById({collection: address })
console.log('collection name', collection.name)
```
Wrap calls in any "retry" function.
```ts
//To do like that
const { address, tx } = await sdk.nft.createCollection({...})
const attempts = 10;
const timeout = 3000;
const collection = await retry(attempts, timeout, async () => {
  return sdk.apis.collection.getCollectionById({collection: address })
})
console.log('collection name', collection.name)
```
## Executing actions

You can use SDK to create (mint), trade, transfer, and burn NFTs. All actions are handled in the same manner:

* You invoke function from SDK (e.g.: [mint](https://docs.rarible.org/reference/mint/))
* Async function returns the so-called PrepareResponse (it's different for different actions)
* PrepareResponse contains all needed information to show the user a form (for example, response for sale contains all supported currency types)
* Collect input from the user (show form and let the user enter the data)
* Pass this data to submit [Action](https://github.com/rarible/ts-common/tree/master/packages/action)

See how to use common SDK functionality in our [documentation](https://docs.rarible.org/reference/reference-overview/):

* [Quick Start](https://docs.rarible.org/getting-started/quick-start/)
* [Create collection](https://docs.rarible.org/reference/create-collection/)
* [Mint NFT](https://docs.rarible.org/reference/mint/)
* [Sell NFTs](https://docs.rarible.org/reference/order/)
* [Mint and Sell](https://docs.rarible.org/reference/mint-and-sell/)
* [Create and Accept Bid](https://docs.rarible.org/reference/bid/)
* [Transfer tokens](https://docs.rarible.org/reference/transfer/)
* [Burn tokens](https://docs.rarible.org/reference/burn/)
* [Get wallet balance](https://docs.rarible.org/reference/get-balance/)
* [Contract Addresses](https://docs.rarible.org/reference/contract-addresses/)
* [Search Capabilities](https://docs.rarible.org/reference/search-capabilities/)

## Troubleshooting

Possible errors after `yarn add @rarible/sdk` command:

<details>
  <summary>Failed to replace env in config: ${NPM_TOKEN}</summary>
 
```shell
error An unexpected error occurred: "Failed to replace env in config: ${NPM_TOKEN}".
```

**Solution**

Type in the command line while in the project folder:

```shell
rm -f ./.npmrc
```

</details>

<details>
  <summary>Adding the dependency to the workspace</summary>

```shell
error Running this command will add the dependency to the workspace root rather than the workspace itself, which might not be what you want - if you really meant it, make it explicit by running this command again with the -W flag (or --ignore-workspace-root-check).
```

**Solution**

Type in the command line while in the project folder:

```shell
yarn add @rarible/sdk -D -W
```

</details>

<details>
  <summary>darwin-arm64.tar.gz downloading error </summary>

```shell
...
node-pre-gyp info it worked if it ends with ok
node-pre-gyp info using node-pre-gyp@0.13.0
node-pre-gyp info using node@16.13.1 | darwin | arm64
node-pre-gyp WARN Using request for node-pre-gyp https download
...
node-pre-gyp http GET https://node-webrtc.s3.amazonaws.com/wrtc/v0.4.7/Release/darwin-arm64.tar.gz
node-pre-gyp http 404 https://node-webrtc.s3.amazonaws.com/wrtc/v0.4.7/Release/darwin-arm64.tar.gz
node-pre-gyp ERR! install error
node-pre-gyp ERR! stack Error: 404 status code downloading tarball https://node-webrtc.s3.amazonaws.com/wrtc/v0.4.7/Release/darwin-arm64.tar.gz
...
```

**Solution**

Type in the command line while in the project folder:

```shell
sudo npm install -g n
sudo n 14.17.6
```

</details>

## Migration guide

For migration your code to version since 0.10.* you should change the following functions:

| before 0.10.0  | since 0.10.0 |
| ------------- | ------------- |
| sdk.nft.mint(...)  | sdk.nft.mint.prepare(...)  |
| sdk.nft.transfer(...)  | sdk.nft.transfer.prepare(...)  |
| sdk.nft.burn(...)  | sdk.nft.burn.prepare(...)  |
| sdk.order.sell(...)  | sdk.order.sell.prepare(...)  |
| sdk.order.sellUpdate(...)  | sdk.order.sellUpdate.prepare(...) |
| sdk.order.buy(...)  | sdk.order.buy.prepare(...) |
| sdk.order.bid(...)  | sdk.order.bid.prepare(...) |
| sdk.order.acceptBid(...)  | sdk.order.acceptBid.prepare(...) |
| sdk.order.bidUpdate(...)  | sdk.order.bidUpdate.prepare(...) |

All of methods above supports simplified call signature, for example:
```ts
const { transaction, itemId } = await sdk.nft.mint({
    uri: "ipfs://IPFS_METADATA_URI",
    collectionId: toCollectionId("ETHEREUM:0x..."),
})
const { hash, blockchain } = await transaction.wait()
```
the same code, but with the legacy approach: 
```ts
const mintResponse = await sdk.nft.mint.prepare({
  collectionId: toCollectionId("ETHEREUM:..."),
})
const mintResult = await mintResponse.submit({
  uri: "ipfs://IPFS_METADATA_URI",
  supply: 1,
  creators: [{
    account: sender,
    value: 10000,
  }],
  royalties: [],
  lazyMint: false,
})
```
[Read more about advanced and simplified calls](#about-advanced-methods-calls) 

* sdk.nft.createCollection has updated call signature
```ts
const { address, tx } = await sdk.nft.createCollection({
    blockchain: Blockchain.ETHEREUM,
    type: "ERC721",
    name: "name",
    symbol: "RARI",
    baseURI: "https://ipfs.rarible.com",
    contractURI: "https://ipfs.rarible.com",
    isPublic: true,
})
```
The legacy property "isUserToken" that means is private user collection will be created.
It should be inverted to the new property "isPublic", for example:
```ts
const { address, tx } = await sdk.nft.createCollection({
  //...
  isUserToken: true,
  //...
})
```
it should be converted to
```ts
const { address, tx } = await sdk.nft.createCollection({
  //...
  isPublic: false,
  //...
})
```

* sdk.order.cancel(...) has the same call signature, but changed from "Action" instance to simple javascript function.



## Suggestions

You are welcome to [suggest features](https://github.com/rarible/protocol/discussions) and [report bugs found](https://github.com/rarible/protocol/issues)!

## Contributing

The codebase is maintained using the "contributor workflow" where everyone without exception contributes patch proposals using "pull requests" (PRs). This facilitates social contribution, easy testing, and peer review.

See more information on [CONTRIBUTING.md](https://github.com/rarible/protocol/blob/main/CONTRIBUTING.md).

## License

Rarible Multichain SDK is available under the [MIT License](LICENSE).

### Note

*This is a pre-release version. Backward compatibility is not fully supported before 1.0 release. Backward compatibility is only guaranteed in minor releases.*

*For example, 0.2.x version may not be compatible with 0.1.x. So, it's advised to include dependencies using package versions (ex. rarible/sdk@0.2.x).*
