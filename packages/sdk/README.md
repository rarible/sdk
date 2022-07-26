
# Rarible SDK

## Create SDK
```ts
const blockchainProvider = ...
const raribleSdk = createRaribleSdk(blockchainProvider, "testnet") //"prod" | "testnet" | "development"
```
See [`examples`](https://github.com/rarible/sdk/tree/master/packages/sdk-examples/src) package

As `blockchainProvider` you can use
* Wallets from [`@rarile/sdk-wallets`](https://github.com/rarible/sdk/tree/master/packages/wallet) package
* Web3 or Ethers providers

```ts
//ethers
import { EthereumWallet } from "@rarible/sdk-wallet";

const blockchainProvider = new ethers.Wallet(pk, new ethers.providers.JsonRpcProvider("https://NODE_URL"))
const raribleSdk = createRaribleSdk(blockchainProvider, "testnet")
//web3
const blockchainProvider = new Web3(provider)
const raribleSdk = createRaribleSdk(blockchainProvider, "testnet")
```
* Fcl provider for Flow
```ts
const raribleSdk = createRaribleSdk(fcl, "testnet")
```
* Solana provider interface with `publicKey` field and `signTransaction`, `signAllTransactions` methods
```ts
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
const blockchainProvider = SolanaKeypairWallet.createFrom(pk)
const raribleSdk = createRaribleSdk(blockchainProvider, "testnet")
```
* TezosProvider for Tezos, in_memory_provider (@rarible/tezos-sdk) or etc.
```ts
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
const blockchainProvider = in_memory_provider(edsk, "https://TEZOS_NODE_URL")
const raribleSdk = createRaribleSdk(blockchainProvider, "testnet")
```
#### About advanced methods calls

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
