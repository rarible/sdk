# Rarible SDK


## Usage

## NFT simple methods

### Minting
```typescript
const { transaction, itemId } = await sdk.nftBasic.mint({
    uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
    collectionId: toCollectionId("ETHEREUM:0x..."),
})
await transaction.wait()
```

Onchain minting request properties:
```
tokenId?: TokenId
(collectionId: CollectionId || collection: Collection)
uri: string
lazyMint?: false
supply?: number
creators?: Creator[]
royalties?: Royalty[]
```
For offchain minting (lazy minting) request object can accept following properties:
```
tokenId?: TokenId
(collectionId: CollectionId || collection: Collection)
uri: string
lazyMint: true
supply?: number
creators?: Creator[]
royalties?: Royalty[]
```
### Transfer
```typescript
const transfer = await sdk.nftBasic.transfer({
    itemId: toItemId("..."),
    to: receipent,
})
```
Transfer request
```typescript
itemId: ItemId
to: UnionAddress
amount?: number
```

### Burn
```typescript
await sdk.nftBasic.burn({
    itemId: toItemId("..."),
    amount: 10,
})
```
Burn request
```typescript
itemId: ItemId
amount?: number
creators?: Creator[]
```

### Creating Collection
```typescript
// ETHEREUM
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
```typescript
// SOLANA
const { address, tx } = await sdk.nftBasic.createCollection({
	blockchain: Blockchain.SOLANA,
	metadataURI: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
})
```
```typescript
// TEZOS
const { address, tx } = await sdk.nftBasic.createCollection({
	blockchain: Blockchain.TEZOS,
	type: "NFT",
	name: "My NFT collection",
	symbol: "MYNFT",
	contractURI: "https://ipfs.io/ipfs/QmTKxwnqqxTxH4HE3UVM9yoJFZgbsZ8CuqqRFZCSWBF53m",
	isPublic: true,
})
```

## Order simple methods


### Create sell order
```typescript
const orderId = await sdk.orderBasic.sell({
    itemId: toItemId("..."),
    amount: 1,
    price: "0.000000000000000002",
    currency: toCurrencyId("ETHEREUM:..."),
})
```
Sell request
```
itemId: ItemId
amount?: number
price: BigNumberValue
currency: RequestCurrency
originFees?: UnionPart[]
payouts?: UnionPart[]
expirationDate?: Date
```

### Update sell order
```typescript
const orderId = sdk.orderBasic.sellUpdate({
    orderId: toOrderId("..."),
    price: toBigNumber("200"),
})
```

### Mint and Sell
```typescript
const { orderId, itemId, transaction } = await sdk.orderBasic.mintAndSell({
    collection: collection,
    tokenId,
    uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
    creators: [{
        account: sender,
        value: 10000,
    }],
    royalties: [],
    lazyMint: false,
    supply: 1,
    price: "0.000000000000000001",
    currency: {
        "@type": "ETH",
    },
})
```

### Buy
```typescript
const tx = await sdk.orderBasic.buy({
    order: toOrderId("..."),
    amount: 1,
})
```
Buy request
```
(order: Order || orderId: OrderId)
amount: number
originFees?: UnionPart[]
payouts?: UnionPart[]
infiniteApproval?: boolean
itemId?: ItemId
```
### Create Bid
```typescript
const orderId = await sdk.orderBasic.bid({
    itemId: toItemId(".."),
    amount: 1,
    price: "0.00000000000002",
    currency: {
        "@type": "ERC20",
        contract: toContractAddress("..."),
    },
    originFees: [{
        account: toUnionAddress("..."),
        value: 1000,
    }],
})
```
Create bid request
```
(itemId: ItemId || collectionId: CollectionId)
price: BigNumberValue
currency: RequestCurrency
amount?: number
originFees?: UnionPart[]
payouts?: UnionPart[]
expirationDate?: Date
```

### Accept bid
```typescript
const acceptBidTx = await sdk.orderBasic.acceptBid({
    orderId: toOrderId("..."),
    amount: 1,
})
```
Accept bid request
```
(order: Order || orderId: OrderId)
amount: number
originFees?: UnionPart[]
payouts?: UnionPart[]
infiniteApproval?: boolean
itemId?: ItemId
unwrap?: boolean
```

### Update bid
```typescript
const updatedOrderId = await sdk.orderBasic.bidUpdate({
    orderId: toOrderId("..."),
    price: "0.00000000000004",
})
```
Update bid request
```
orderId: OrderId
price: BigNumberValue
```

### Cancel order
```typescript
const tx = await sdk1.orderBasic.cancel({ orderId: toOrderId("...") })
```




