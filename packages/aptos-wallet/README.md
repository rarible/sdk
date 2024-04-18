# Rarible Solana SDK

## Build & Tests

```shell
yarn install
yarn build
yarn test
```

### Example

```ts
import { SolanaSdk } from "@rarible/solana-sdk"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"

// init sdk
const sdk = SolanaSdk.create({ connection: { cluster: "devnet", commitmentOrConfig: "confirmed" } })
// generate new wallet
const wallet = SolanaKeypairWallet.fromSeed(undefined)

// airdrop some SOL to new wallet
const airdropTx = await sdk.connection.requestAirdrop(
  wallet.publicKey,
  2 * 1000000000, // 2 * LAMPORTS_PER_SOL
)
// awaiting transaction confirmation
await sdk.confirmTransaction(airdropTx)

// cheking balance
console.log("current balance: ", await sdk.balances.getBalance(wallet.publicKey))
```

## Usage

### SDK init

```ts
const sdk = SolanaSdk.create({ 
  connection: { 
    cluster: "devnet", // solana network
    commitmentOrConfig: "confirmed" // cnnection options
  }
})
```

### Solana Wallet

In terms of Rarible Solana SDK, a wallet is an object that implements an interface with the following fields and methods:

```ts
interface IWalletSigner {
  publicKey: PublicKey
  signTransaction(tx: Transaction): Promise<Transaction>
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>
}
```

The main task of the wallet is to sign transactions. In all methods that require a `signer` field, the wallet passed in this parameter will be used to sign the transaction and pay the transaction fee.

### Transaction submitting

Most of the SDK methods that change the state of the blockchain return a `PreparedTransaction` object, which can be used to combine several transactions (see below), or can be submitted immediately with level of confirmation from the cluster.

Example:

```ts
const prepared = await sdk.order.buy({
  signer: wallet,
  auctionHouse: new PublicKey("8Qu3az..."),
  price: price,
  tokensAmount: 1,
  mint: new PublicKey("Ij85yo..."),
})
prepared.submit("max") // submit to blockchain 
```

### Transaction combining

You can combine several actions to one transaction with method `sdk.unionInstructionsAndSend`

Example:

```ts
// prepare buy action
const buyPrepared = await sdk.order.buy({
  signer: wallet,
  auctionHouse: auctionHousePublicKey,
  price: price,
  tokensAmount: 1,
  mint: mintPublicKey,
})

// prepare execute_sell action
const executePrepared = await this.sdk.order.executeSell({
  signer: wallet,
  auctionHouse: auctionHousePublicKey,
  buyerWallet: buyerWalletPublicKey,
  sellerWallet: sellerWalletPublicKey,
  mint: mintPublicKey,
  price: price,
  tokensAmount: 1,
})
  
// combine them in one transaction & submit
await sdk.unionInstructionsAndSend(
  wallet,
  [buyPrepared, executePrepared],
  "max"
) 
```

### Balance query

```ts
// will return SOL balance for given wallet
const balance = await sdk.balances.getBalance(ownerWalletPublicKey)
```

```ts
// will return tokens (mint) amount for given wallet
const tokensBalance = await sdk.balances.getTokenBalance(ownerWalletPublicKey, mintPublicKey)
```


### Minting NFT

```ts
const mintPrepare = await sdk.nft.mint({
  signer: wallet,
  
  // metadata json file (https://docs.metaplex.com/architecture/deep_dive/overview#uri-json-schema)
  metadataUrl: "https://...",

  // collection token address, if passed null - token will have no collection, and can be used as collection for other tokens
  collection: null,

  // max supply for master edition. Should be 0 if you want to mint an collection token  
  maxSupply: 0,
})

const mintTx = await mintPrepare.tx.submit("max") // submit transaction and wait for `max` confirmation 
console.log("mint address: ", mintPrepare.mint)
```

### Collection Verify
If you minted a token with specific collection field, the owner of the collection needs to verify this collection for this token, otherwise the token will not be presented on marketplaces as part of this collection.

```ts
const prepare = await this.sdk.collection.verifyCollection({
  signer: wallet,
  collection: collectionPublicKey,
  mint: mintPublicKey,
})
await prepare.submit("max")
```

### Token Account Address
Some methods require `tokenAccount` address, you can get what address with method

```ts
const tokenAccount = await this.sdk.connection.getTokenAccountsByOwner(ownerWalletAddress, { 
  mint: mintPublicKey
})
```

### Transfer / Burn Tokens

```ts
const prepare = await sdk.nft.transfer({
  signer: wallet,
  mint: mintPublicKey,
  amount: 1,
  // destintion user wallet public key
  to: destinationPublicKey,
})

// submit method returning transaction id
const transferTx = await prepare.submit("max") 

```

```ts
const prepare = await sdk.nft.burn({
  signer: wallet,
  mint: mint,
  amount: 1,
})
const burnTx = await prepare.submit("max")
```

### Sell & Buy tokens

Rarible Solana SDK uses [Metaplex Auction House](https://docs.metaplex.com/auction-house/definition) a protocol for making NFT trades

#### Sell / Accept Bid

```ts
const prepare = await sdk.order.sell({
  auctionHouse: auctionHousePublicKey,
  signer: sellerWallet,
  // price in AuctionHouse currecy (wost likely SOL)
  price: price,
  tokensAmount: 1,
  mint: mintPublicKey,
})
await prepare.submit("max")
```

`sdk.order.acceptBid()` is alias for `sdk.order.sell()`


#### Buy / Bid

```ts
const prepare = await sdk.order.buy({
	signer: wallet,
	auctionHouse: auctionHousePublicKey,
	price: price,
	tokensAmount: 1,
	mint: mintPublicKey,
})
await prepare.submit("max")
```

`sdk.order.bid()` is alias for `sdk.order.buy()`

#### Execute Trade

Trades between seller and buyer are not automatically committed, someone has to call the `executeSell` method to do so.

```ts
const prepare = await this.sdk.order.executeSell({
  signer: wallet,
  auctionHouse: auctionHousePublicKey,
  buyerWallet: buyerWalletPublicKey,
  sellerWallet: sellerWalletPublicKey,
  mint: mintPublicKey,
  price: price,
  tokensAmount: 1,
})
await prepare.submit("max")
```

#### Cancelling trade order

You can cancel your buy/sell request by execution `cancel` method.

Note: `price` and `amount` must be exactly the same as in the buy/sell request.

```ts
const prepare = await this.sdk.order.cancel({
  signer: wallet,
  auctionHouse: auctionHousePublicKey,
  mint: mintPublicKey,
  price: price,
  tokensAmount: 1,
})
await prepare.submit("max")
```

### Auction House Escrow Managing

You can deposit/withdraw the Auction House account used for bids.

#### Check Balance

```ts
const balance = await sdk.auctionHouse.getEscrowBalance({
  signer: wallet,
  // wallet address whose balance to check
  wallet: walletPublicKey,
  auctionHouse: auctionHousePublicKey,
})
```

#### Deposit

```ts
const prepare = await sdk.auctionHouse.depositEscrow({
  signer: wallet,
  auctionHouse: auctionHousePublicKey,
  // Amount of Auction House currency to deposit
  amount: 1,
})

await prepare.submit("max")
```

#### Withdraw

```ts
const prepare = await sdk.auctionHouse.withdrawEscrow({
  signer: wallet,
  auctionHouse: auctionHousePublicKey,
  // Amount of Auction House currency to withdraw
  amount: 1,
})

await prepare.submit("max")
```
