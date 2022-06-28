# Rarible Multichain SDK

## Create SDK

```ts
const blockchainProvider = ...
const raribleSdk = createRaribleSdk(blockchainProvider, "staging")
```

As `blockchainProvider` you can use
* Wallets from [`@rarile/sdk-wallets`](https://github.com/rarible/sdk/tree/master/packages/wallet) package
* Web3 or Ethers providers
* Flc provider for Flow
* Solana provider interface with `publicKey` field and `signTransaction`, `signAllTransactions` methods
* TezosProvider for Tezos

## Usage

#### About advanced methods calls

Most methods have two ways to call, simple and advanced. The advanced methods consists of two stages: preparation and submit, and gives more information and control to complete the transaction.
Example of sell NFT with simple and advanced ways:
```ts
// Simple
const orderId = await sdk.orderBasic.sell({
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
const prepare = await sdk.order.sell({
  itemId: toItemId("ETHEREUM:0x64f088254d7ede5dd6208639aabf3614c80d396d:108764404607684442395098549286597885532295288457125436143364084161803586633729"),
})

// `prepare` object contains `sumbit` method and some usefull data like available features for this call for this blockchain/collection/item

const orderId = await prepare.submit({
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
const { address, tx } = await sdk.nftBasic.createCollection({
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
const { address, tx } = await sdk.nftBasic.createCollection({
    blockchain: Blockchain.SOLANA,
    metadataURI: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
})
```
More information about [solana metadata format](https://docs.metaplex.com/architecture/deep_dive/overview#uri-json-schema)

#### Tezos
```typescript
const { address, tx } = await sdk.nftBasic.createCollection({
    blockchain: Blockchain.TEZOS,
    type: "NFT",
    name: "My NFT collection",
    symbol: "MYNFT",
    contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
    isPublic: true,
})
```

> *Notice:* this method has an advanced call `sdk.nft.createCollection({})`

### Mint

#### Ethereum
```typescript
const { transaction, itemId } = await sdk.nftBasic.mint({
    uri: "ipfs://IPFS_METADATA_URI",
    collectionId: toCollectionId("ETHEREUM:0x..."),
})
await transaction.wait()
```

#### Solana
```ts
await sdk.nftBasic.mint({
  collectionId: toCollectionId("SOLANA:..."),
  uri: "https://SOLANA_METADATA_URI",
})
```

#### Tezos
```ts
const mintResult = await sdk.nftBasic.mint({
  collectionId: toCollectionId("TEZOS:..."),
  uri: "ipfs://TEZOS_IPFS_METADATA_URI",
  supply: 12,
  royalties: [{
    account: toUnionAddress("TEZOS:..."),
    value: 10000,
  }],
  creators: [{
    account: toUnionAddress("TEZOS:..."),
    value: 10000,
  }],
})
```

#### Flow
```ts
const { itemId } = await mint.mintBasic({
  collectionId: toCollectionId("FLOW:..."),
  uri: "https://FLOW_METADATA_URI",
})
```

> *Notice:* this method has an advanced call `sdk.nft.mint({})`

### Transfer

Transfer token to another wallet.

```ts
await sdk.nftBasic.transfer({
  itemId: toItemId("YOUR_ITEM_ID"),
  to: toUnionAddress("DESTINATION_WALLET_ADDRESS"),
  amount: 1,
})
```

> *Notice:* this method has an advanced call `sdk.nft.transfer({})`

### Burn

Burning an NFT

```typescript
await sdk.nftBasic.burn({
    itemId: toItemId("YOUR_ITEM_ID"),
    amount: 1,
})
```

> *Notice:* this method has an advanced call `sdk.nft.burn({})`


### Sell

Selling NFT

```typescript
const orderId = await sdk.orderBasic.sell({
    itemId: toItemId("YOUR_ITEM_ID"),
    amount: 1,
    price: "0.01",
    currency: toCurrencyId("ETHEREUM:..."),
})
```

> *Notice:* this method has an advanced call `sdk.order.sell({})`

### Buy

Buy NFT using sell order

```typescript
const tx = await sdk.orderBasic.buy({
    order: toOrderId("..."),
    amount: 1,
})
```
> *Notice:* this method has an advanced call `sdk.order.buy({})`

### Bid

Place bid order for an NFT

```typescript
const orderId = await sdk.orderBasic.bid({
    itemId: toItemId("..."),
    amount: 1,
    price: "0.01",
    currency: {
        "@type": "ERC20",
        contract: toContractAddress("..."),
    }
})
```
> *Notice:* this method has an advanced call `sdk.order.bid({})`

### Accept Bid

Accept bid request using bid order

```typescript
const acceptBidTx = await sdk.orderBasic.acceptBid({
    orderId: toOrderId("..."),
    amount: 1,
})
```
> *Notice:* this method has an advanced call `sdk.order.acceptBid({})`

### Update Sell Order

Update price for given sell order

```typescript
const orderId = sdk.orderBasic.sellUpdate({
    orderId: toOrderId("..."),
    price: "0.2",
})
```
> *Notice:* this method has an advanced call `sdk.order.sellUpdate({})`

### Update Bid Order

Update price for given bid order

```typescript
const orderId = sdk.orderBasic.bidUpdate({
    orderId: toOrderId("..."),
    price: "0.2",
})
```
> *Notice:* this method has an advanced call `sdk.order.bidUpdate({})`

### Cancel Sell/Bid order

```typescript
await sdk.orderBasic.cancel({ orderId: toOrderId("...") })
```
> *Notice:* this method has an advanced call `sdk.order.cancel({})`

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
