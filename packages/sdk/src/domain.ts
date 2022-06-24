import type * as ApiClient from "@rarible/api-client"
import type { BlockchainGroup } from "@rarible/api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { EthereumNetworkConfig } from "@rarible/protocol-ethereum-sdk/build/types"
import type { AuthWithPrivateKey } from "@rarible/flow-sdk/build/types"
import type { IMint, IUploadMeta } from "./types/nft/mint/domain"
import type { ISell, ISellInternal, ISellUpdate } from "./types/order/sell/domain"
import type { IFill } from "./types/order/fill/domain"
import type { IBurn } from "./types/nft/burn/domain"
import type { ITransfer } from "./types/nft/transfer/domain"
import type { IBid, IBidUpdate } from "./types/order/bid/domain"
import type { IMintAndSell } from "./types/nft/mint-and-sell/domain"
import type { ICancel } from "./types/order/cancel/domain"
import type {
	IConvert,
	IDepositBiddingBalance,
	IGetBalance,
	IGetBiddingBalance,
	IWithdrawBiddingBalance,
} from "./types/balances"
import type { IGenerateTokenId } from "./types/nft/generate-token-id"
import type { ICreateCollection } from "./types/nft/deploy/domain"
import type { IRestrictionSdk } from "./types/nft/restriction/domain"
import type { IPreprocessMeta } from "./types/nft/mint/preprocess-meta"
import type { Middleware } from "./common/middleware/middleware"
import type { RaribleSdkEnvironment } from "./config/domain"
import type { ICryptopunkUnwrap, ICryptopunkWrap } from "./types/ethereum/domain"
import type { ISolanaSdkConfig } from "./sdk-blockchains/solana/domain"

export enum LogsLevel {
	DISABLED = 0,
	ERROR = 1,
	TRACE = 2,
}

export interface ISdkContext {
	wallet?: BlockchainWallet,
	env: RaribleSdkEnvironment,
	config?: IRaribleSdkConfig
}

export interface IRaribleSdkConfig {
	/**
	 * Parameters for requests to protocol API
	 */
	apiClientParams?: ApiClient.ConfigurationParameters
	/**
	 * Logging level
	 */
	logs?: LogsLevel
	/**
	 * Blockchain settings
	 */
	blockchain?: {
		/**
		 * Solana blockchain config
		 */
		[BlockchainGroup.SOLANA]?: ISolanaSdkConfig,
	}
	/**
	 * Meddlewares
	 */
	middlewares?: Middleware[]
	/**
	 * Ethereum config
	 */
	ethereum?: EthereumNetworkConfig
	/**
	 * Polygon config
	 */
	polygon?: EthereumNetworkConfig
	/**
	 * Flow config
	 */
	flow?: { auth: AuthWithPrivateKey }
}

/**
 * Rarible sdk instance methods
 *
 * @property [[`IApisSdk`]] apis Protocol api client methods
 * @property [[`INftSdk`]] nft Nft methods, mint, transfer, burn etc.
 * @property [[`IOrderSdk`]] order Order methods, sell, buy, bid etc.
 * @property [[`IBalanceSdk`]] balances Balance methods
 * @property [[`IRestrictionSdk`]] restriction Restriction methods
 * @property {Maybe<BlockchainWallet>} wallet Wallet methods
 * @property [[`IEthereumSdk`]] [ethereum]
 */
export interface IRaribleSdk {
	/**
	 * Protocol api methods
	 */
	apis: IApisSdk
	/**
	 * Nft methods Mint, Transfer, Burn, Meta manipulation
	 */
	nft: INftSdk
	/**
	 * Order methods, create/update/cancel sel|bid orders
	 */
	order: IOrderSdk
	/**
	 * Balance methods
	 */
	balances: IBalanceSdk
	/**
	 * Restriction methods
	 * - canTransfer - {@link IRestrictionSdk.canTransfer}
	 */
	restriction: IRestrictionSdk
	/**
	 * Wallet methods
	 * -
	 * - getBalance - {@link IGetBalance}
	 * - convert - {@link IConvert}
	 * - getBiddingBalance - {@link IGetBiddingBalance}
	 * - depositBiddingBalance - {@link IDepositBiddingBalance}
	 * - withdrawBiddingBalance - {@link IWithdrawBiddingBalance}
	 */
	wallet: Maybe<BlockchainWallet>
	ethereum?: IEthereumSdk
}

/**
 * Rarible Protocol Apis
 */
export interface IApisSdk {
	order: ApiClient.OrderControllerApi
	currency: ApiClient.CurrencyControllerApi
	auction: ApiClient.AuctionControllerApi
	collection: ApiClient.CollectionControllerApi
	activity: ApiClient.ActivityControllerApi
	item: ApiClient.ItemControllerApi
	ownership: ApiClient.OwnershipControllerApi
}

/**
 * Nft methods
 * @property {ITransfer} transfer - Transfers self owned asset to recipient
 * @property {IPreprocessMeta} preprocessMeta - Prepare meta data before upload to ipfs storage
 * @property {IMint} mint - Mint token
 * @property {IMintAndSell} mintAndSell - Mint token and create sell order from it
 * @property {IBurn} burn - Burn token
 * @property {IGenerateTokenId} generateTokenId - Generates a token id (for future minting)
 * @property {createCollection} deploy - deprecated Use {@link createCollection} instead
 * @property {ICreateCollection} createCollection - Create collection - Deploy contract with custom properties
 * @property {IUploadMeta} uploadMeta - Upload meta data to nftStorage (for future minting)
 */
export interface INftSdk {
	/**
	 * Transfers self owned asset to recipient
	 * -
	 * @param request - {itemId: ItemId}
	 * @returns response - {
	 *   <p>multiple: boolean</p>
	 *   <p>maxAmount: {@link BigNumber}</p>
	 *   <p>submit: ({to: {@link UnionAddress}, amount?: number}) => Promise<IBlockchainTransaction></p>
	 * <p>}</p>
	 *
	 * @example
	 * const prepareTransfer = await sdk.nft.transfer({itemId: "ETHEREUM:..."})
	 * const tx = prepareTransfer.submit({to: "ETHEREUM:0x...", amount: 1})
	 *
	 */
	transfer: ITransfer
	/**
	 * Prepare meta data before upload to ipfs storage
	 * @param {PreprocessMetaRequest} meta metadata request for prepare
	 * @returns {PreprocessMetaResponse}
	 *
	 * @example
	 *
	 * const prepared = sdk.nft.preprocessMeta({
	 *   name: "Test",
	 *   description: "Test",
	 *   image: {File},
	 *   animation: {File},
	 *   external: "http://",
	 *   attributes: [{key: "test", value: "test"}]
	 * })
	 */
	preprocessMeta: IPreprocessMeta
	/**
	 * Mint token
	 * @example
	 *
	 * import { toUnionAddress } from "@rarible/types"
	 *
	 * const prepare = sdk.nft.mint({tokenId: toTokenId("ETHEREUM:0x...")})
	 * const tx = prepare.submit({
	 *		uri: "ipfs://..."
	 *		supply: 1
	 *		lazyMint: false
	 *		creators?: [{account: toUnionAddress("ETHEREUM:0x..."), value: 100}]
	 *		royalties?: [{account: toUnionAddress("ETHEREUM:0x..."), value: 100}]
	 * })
	 */
	mint: IMint
	/**
	 * Mint token and create sell order from it
	 * @example
	 * import { toUnionAddress } from "@rarible/types"
	 *
	 * const prepare = sdk.nft.mint({tokenId: toTokenId("ETHEREUM:0x...")})
	 * const tx = prepare.submit({
	 *		uri: "ipfs://...",
	 *		supply: 1,
	 *		lazyMint: false,
	 *		creators?: [{account: toUnionAddress("ETHEREUM:0x..."), value: 100}],
	 *		royalties?: [{account: toUnionAddress("ETHEREUM:0x..."), value: 100}],
	 *		price: toBn("1"),
	 *		currency: {"@type": "ETH"},
	 *		originFees?: [{account: toUnionAddress("ETHEREUM:0x...")}],
	 *		payouts?: [{account: toUnionAddress("ETHEREUM:0x...")}]
	 *		expirationDate?: 1234567890
	 * })
	 */
	mintAndSell: IMintAndSell
	/**
	 * Burn token
	 * -
	 * @example
	 * const prepare = sdk.nft.burn({itemId: toUnionId("ETHEREUM:0x...")})
	 * const tx = prepare.submit({amount?: 5, creators?: [{account: toUnionAddress("ETHEREUM:0x...", value: 100)}]})
	 */
	burn: IBurn
	/**
	 * Generates a token id (for future minting)
	 * -
	 * @example
	 * const {tokenId, signature} = sdk.nft.generateTokenId({
	 * 		collection: toContractAddress("ETHEREUM:0x..."),
	 * 		minter: toUnionAddress("ETHEREUM:0x...")},
	 * 	)
	 *
	 */
	generateTokenId: IGenerateTokenId
	/**
   * @deprecated Use {@link createCollection} instead
   */
	deploy: ICreateCollection
	/**
	 * Create collection - Deploy contract with custom properties
	 * -
	 * @example
	 * const { tx, address } = sdk.nft.createCollection({
	 *	blockchain: Blockchain.ETHEREUM,
	 *	asset: {
	 *		assetType: "ERC721",
	 *		arguments: {
	 *				name: "name",
	 *				symbol: "RARI",
	 *				baseURI: "https://ipfs.rarible.com",
	 *				contractURI: "https://ipfs.rarible.com",
	 *				isUserToken: false,
	 *			},
	 *		},
	 * })
	 */
	createCollection: ICreateCollection
	/**
	 * Upload meta data to nftStorage (for future minting)
	 * @example
	 * import { toUnionAddress } from "@rarible/types"
	 * const sdk.nft.uploadMeta({
	 * 		nftStorageApiKey: "your_nft_storage_api_key",
	 *  	properties: {
	 *  	 	name: string
	 *			description?: string
	 *			image?: File
	 *			animationUrl?: File
	 *			attributes: MintAttribute[]
	 *  	},
	 *  	accountAddress: toUnionAddress("ETHEREUM:0x...")
	 *  })
	 */
	uploadMeta: IUploadMeta
}

/**
 * Order methods
 * @property {ISell} sell Creates sell order
 * @property {ISellUpdate} sellUpdate Update order
 * @property {IFill} buy Buy item(s) by filling sell order
 * @property {IFill} acceptBid Confirm item selling by filling buy(bid) order
 * @property {IBid} bid Create bid order
 * @property {IBidUpdate} bidUpdate Update bid order
 * @property {ICancel} cancel Cancel order
 */
export interface IOrderSdk {
	/**
	 * Create sell order
	 */
	sell: ISell
	sellUpdate: ISellUpdate
	/**
	 * @deprecated Use {@link buy} or {@link acceptBid} instead
	 */
	fill: IFill
	/**
	 * Buy item(s) by filling sell order
	 */
	buy: IFill
	/**
	 * Confirm item selling by filling bid order
	 */
	acceptBid: IFill
	/**
	 * Place a bid order on NFT
	 */
	bid: IBid
	/**
	 * Update bid order
	 */
	bidUpdate: IBidUpdate
	/**
	 * Cancel sell/bid order
	 */
	cancel: ICancel
}
/**
 * Balance methods
 *
 * @property {IGetBalance} getBalance Fetch balance of fungible or non-fungible tokens
 * @property {IConvert} convert Convert funds to wrapped token or unwrap existed tokens (ex. ETH->wETH, wETH->ETH)
 * @property {IGetBiddingBalance} getBiddingBalance
 * @property {IDepositBiddingBalance} depositBiddingBalance
 * @property {IWithdrawBiddingBalance} withdrawBiddingBalance
 */
export interface IBalanceSdk {
	getBalance: IGetBalance
	convert: IConvert

	getBiddingBalance: IGetBiddingBalance
	depositBiddingBalance: IDepositBiddingBalance
	withdrawBiddingBalance: IWithdrawBiddingBalance
}

export interface IEthereumSdk {
	wrapCryptoPunk: ICryptopunkWrap,
	unwrapCryptoPunk: ICryptopunkUnwrap,
}

export type IRaribleInternalSdk = Omit<IRaribleSdk, "order" | "nft" | "apis" | "wallet"> & {
	nft: INftInternalSdk
	order: IOrderInternalSdk
	balances: IBalanceSdk
}

export type INftInternalSdk = Omit<INftSdk, "mintAndSell"> & {
	generateTokenId: IGenerateTokenId
}

export type IOrderInternalSdk = Omit<IOrderSdk, "sell"> & {
	sell: ISellInternal
}
