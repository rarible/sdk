# Rarible Protocol Ethereum Software Development Kit

Rarible Protocol Ethereum SDK enables applications to easily interact with Rarible protocol.

See more information about Rarible Protocol at [docs.rarible.org](https://docs.rarible.org).

## Installation

```angular2html
npm install -D @rarible/protocol-ethereum-sdk
```

or inject package into your web page with web3 instance

```angular2html
<script src="https://unpkg.com/@rarible/web3-ethereum@0.10.0/umd/rarible-web3-ethereum.js" type="text/javascript"></script>
<script src="https://unpkg.com/@rarible/protocol-ethereum-sdk@0.10.0/umd/rarible-ethereum-sdk.js" type="text/javascript"></script>
<script src="https://unpkg.com/web3@1.6.0/dist/web3.min.js" type="text/javascript"></script>
```

## With protocol-ethereum-sdk, you can:

- Create sell orders
- Create/accept bid on NFTs
- Create/finish/cancel auctions and also put bids and buy out NFTs
- Buy tokens for regular sell orders
- Create Lazy Mint NFT ERC721 and ERC1155 tokens
- Make regular mint
- Transfer tokens
- Burn tokens

## API reference

You can view the reference for the [latest version of the API](https://ethereum-api.rarible.org/v0.1/doc) or choose API on [different Ethereum networks](https://docs.rarible.org/#api-reference).

## Libraries support

[web3.js](https://github.com/ChainSafe/web3.js/tree/v1.4.0) and [ethers.js](https://github.com/ethers-io/ethers.js) libraries are supported.

You can use the following types of providers:

- `web3` - [web3.js](https://web3js.readthedocs.io/en/v1.5.2/web3.html#providers) provider
- `ethersEtherium` - [ethers.js](https://docs.ethers.io/v5/api/providers/#providers) default provider
- `Web3Ethereum` - moving from a web3.js based application [to ethers](https://docs.ethers.io/v5/api/providers/other/#Web3Provider) by wrapping an existing Web3-compatible and exposing it as an ethers.js provider

[Signer](https://docs.ethers.io/v5/api/signer/#signers) from ethers.js is also supported.

## Usage with web3.js

Below examples show how you can implement supported functions in you app.

### Configure and create Rarible SDK object

```typescript
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"

const sdk = createRaribleSdk(web3, env, { fetchApi: fetch })
```

- web3 - configured with your provider [web3js](https://github.com/ChainSafe/web3.js/tree/v1.4.0) client
- env - environment configuration name, it should accept one of these values
  ``` 'ropsten' | 'rinkeby' | 'mainnet' | 'e2e'```

### Configure Rarible SDK in browser

```angular2html
const web = new Web3(ethereum)
const web3Ethereum = new window.raribleWeb3Ethereum.Web3Ethereum({ web3: web })
const env = "mainnet" // "e2e" | "ropsten" | "rinkeby" | "mainnet"
const raribleSdk = new window.raribleEthereumSdk.createRaribleSdk(web3Ethereum, env)
```
- ethereum - metamask browser instance (window.ethereum)

Сheck out our [**DEMO PAGE**](/packages/sdk/example/index.html)

### Create sell order

```typescript
const order: Order = await sdk.order.sell(request)
// Sell request example:
const contractErc20Address: Address = '0x0' // your ERC20 contract address
const contractErc721Address: Address = '0x0' // your ERC721 contract address
const tokenId: BigNumber = '0x0' // the ERC721 Id of the token on which we want to place a bid
const sellerAddress: Address = '0x0' // Owner of ERC721 token
const nftAmount: number = 1 // For ERC721 always be 1
const sellPrice: number = 10 // price per unit of ERC721 or ERC1155 token(s)
const request = {
	makeAssetType: {
		assetClass: "ERC1155",
		contract: contractErc721Address,
		tokenId: tokenId,
	},
	maker: sellerAddress,
	amount: nftAmount,
	originFees: [],
	payouts: [],
	price: sellPrice,
	takeAssetType: {
		assetClass: "ERC20",
		contract: contractErc20Address
	},
}
```

Returns an object of created order.

[Sell e2e test](https://github.com/rariblecom/protocol-e2e-tests/blob/master/packages/tests-current/src/erc721-sale.test.ts)

### Create bid

```typescript
const order: Order = await sdk.order.bid(request)

// Bid request example:
const contractErc20Address: Address = '0x0' // your ERC20 contract address
const contractErc721Address: Address = '0x0' // your ERC721 contract address
const tokenId: BigNumber = '0x0' // the ERC721 Id of the token on which we want to place a bid
const sellerAddress: Address = '0x0' // Owner of ERC721 token
const buyerAddress: Address = '0x0' // Who make a bid
const nftAmount: number = 1 // For ERC721 always be 1
const bidPrice: number = 10 // price per unit of ERC721 or ERC1155 token(s)

const request = {
	makeAssetType: {
		assetClass: "ERC20",
		contract: contractErc20Address,
	},
	maker: buyerAddress,
	takeAssetType: {
		assetClass: "ERC721",
		contract: contractErc721Address,
		tokenId: tokenId,
	},
	taker: sellerAddress,
	amount: nftAmount,
	originFees: [],
	payouts: [],
	price: bidPrice,
}
```

Returns an object of created bid order.

[Bid e2e test](https://github.com/rariblecom/protocol-e2e-tests/blob/master/packages/tests-current/src/create-bid.test.ts)

### Purchase order or accept bid

```typescript
const order: SimpleOrder

sdk.order.buy({ order, payouts: [], originFees: [], amount: 1, infinite: true })
// or
sdk.order.acceptBid({ order, payouts: [], originFees: [], amount: 1, infinite: true })
```

For example, you can get the `order` object using our sdk api methods `sdk.apis.order.getSellOrders({})` and pass it
to `buy` function. You can get more information in the test
repository [sell e2e test](https://github.com/rariblecom/protocol-e2e-tests/blob/master/packages/tests-current/src/erc721-sale.test.ts)

## Auctions

You can create auction:
```typescript
const auction = sdk.auction.start({
  makeAssetType: { // NFT asset type
    assetClass: "ERC1155",
    contract: toAddress(nftContractAddress),
    tokenId: toBigNumber("1"),
  },
  amount: toBigNumber("1"), // NFT amount, for ERC721 always be 1
  takeAssetType: { // payment token asset type
    assetClass: "ERC20",
    contract: toAddress(paymentTokenContractAddress),
  },
  minimalStepDecimal: toBigNumber("0.1"), // Minimal step of next bid (0.5, 0.6 and etc...)
  minimalPriceDecimal: toBigNumber("0.5"), // Minimal bid price
  duration: 1000, // Auction duration in seconds, less 15 minutes (60*60*15) and greater than 1000 days 
  startTime: 0, // Timestamp start of auction. If not set, auction will start when first bid will place 
  buyOutPriceDecimal: toBigNumber("1"), // Buy out price
  originFees: [], // Origin fees in format: { address, value } (value in range 0-10000, where 10000 - 100%, 0 - 0%)
})
await auction.tx.wait() // Waiting for tx accepting
```
it returns 
```typescript
{ 
  tx, // EthereumTransaction
  hash, // Promise<string> - auction hash
  auctionId // Promise<string> - ID auction 
}
```


Place an auction bid:
```typescript
sdk.auction.putBid({
  hash: auctionHash, // Hash of auction, created during start auction
  priceDecimal: toBigNumber("0.2"), // Bid price
  originFees: [{ // Optional - origin fees
    account: toAddress(feeAddress),
    value: 1000,
  }],
})
```

Buy out NFT
```typescript
sdk.auction.putBid({
  hash: auctionHash, // Hash of auction, created during start auction
})
```

Cancel auction
```typescript
sdk.auction.cancel({
  hash: auctionHash, // Hash of auction, created during start auction
})
```

Finish auction
```typescript
sdk.auction.finish({ // You can finish auction when duration is over and made at least one bid 
  hash: auctionHash, // Hash of auction, created during start auction
})
```

### Mint NFT Tokens

You can mint ERC721 and ERC1155 tokens in two ways:

1. Regular "on chain" minting using contract.
2. Off chain minting (the transaction itself and payment for gas occurs at the time of purchase or transfer).

You can use mint to create a token in different collections. Depending on the collection type, different mint requests should be sent to the function (isErc1155v1Collection, isErc1155v2Collection etc).

Mint function checks:

* Request for MintOffChainResponse or MintOnChainResponse.
* Token type: ERC721 or ERC1155.

Differences between mint functions in the presence of arguments `creators`, `supply` and `lazy`:

* `creators` not use in ERC1155 v1
* `supply` used only for ERC1155 v1 and v2
* `lazy` is used if the passed collection supports lazy mint. Otherwise, the usual mint will be performed

For more information, see [mint.ts](https://github.com/rarible/protocol-ethereum-sdk/blob/master/packages/protocol-ethereum-sdk/src/nft/mint.ts).

ERC1155 V2 Lazy example:

```typescript
return mint({
  collection,    // Collection info
  uri: "",       // Token URI
  royalties: [], // The amount of royalties
  supply: 1,     // Number of the tokens to mint, used only for ERC1155
  creators: [],  // Creators of token
  lazy: true,    // The token will be lazy minted or not
})
```

For more information, see [mint.md](https://github.com/rarible/protocol-ethereum-sdk/blob/master/packages/protocol-ethereum-sdk/src/nft/mint.md).

[Mint e2e test](https://github.com/rariblecom/protocol-e2e-tests/blob/master/packages/tests-current/src/lazy-mint.test.ts)

### Transfer

```typescript
transfer(asset, to[, amount])

Transfer request params:

asset: {
    tokenId: BigNumber, // - id of token to transfer
    contract: Address, // - address of token contract
    assetClass?: "ERC721" | "ERC1155" // - not required, type of asset
}
to: Address, // - ethereum address of receiver of token
amount: BigNumber // - amount of asset to transfer, used only for ERC1155 assets
```

Example

```typescript
const hash = await sdk.nft.transfer(
	{
		assetClass: "ERC1155",
		contract: toAddress(contractAddress),
		tokenId: toBigNumber(tokenId),
	},
	receiverAddress,
	toAddress('10')
)

```

### Burn

```typescript
const hash = await sdk.nft.burn({
	contract: contractAddress,
	tokenId: toBigNumber(tokenId),
})
```

## Suggestions

You are welcome to [suggest features](https://github.com/rarible/protocol/discussions) and [report bugs found](https://github.com/rarible/protocol/issues)!

## Contributing

The codebase is maintained using the "contributor workflow" where everyone without exception contributes patch proposals using "pull requests" (PRs). This facilitates social contribution, easy testing, and peer review.

See more information on [CONTRIBUTING.md](https://github.com/rarible/protocol/blob/main/CONTRIBUTING.md).

## License

Rarible Protocol Ethereum SDK is available under the [MIT License](LICENSE).

## Note

*This is a pre-release version. Backward compatibility is not fully supported before 1.0 release. Backward compatibility is only guaranteed in minor releases.*

*For example, 0.2.x version may not be compatible with 0.1.x. So, it's advised to include dependencies using package versions (ex. rarible/sdk@0.2.x).*
