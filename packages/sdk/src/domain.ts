import type * as ApiClient from "@rarible/api-client"
import type { WalletType } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { AuthWithPrivateKey } from "@rarible/flow-sdk"
import type { AbstractLogger } from "@rarible/logger/build/domain"
import type { AptosSdkConfig } from "@rarible/aptos-sdk/build/domain"
import type {
  IConvert,
  IDepositBiddingBalance,
  IGetBalance,
  IGetBiddingBalance,
  IWithdrawBiddingBalance,
} from "./types/balances"
import type { IGenerateTokenId } from "./types/nft/generate-token-id"
import type { IRestrictionSdk } from "./types/nft/restriction/domain"
import type { IPreprocessMeta } from "./types/nft/mint/preprocess-meta"
import type { Middleware } from "./common/middleware/middleware"
import type { RaribleSdkEnvironment } from "./config/domain"
import type { ICryptopunkUnwrap, ICryptopunkWrap } from "./types/ethereum/domain"
import type { ISolanaSdkConfig } from "./sdk-blockchains/solana/domain"
import type { IMint } from "./types/nft/mint"
import type { IMintAndSell } from "./types/nft/mint-and-sell"
import type { ITransfer } from "./types/nft/transfer"
import type { IBurn } from "./types/nft/burn"
import type { ICreateCollection } from "./types/nft/deploy"
import type { ISell } from "./types/order/sell"
import type { ISellUpdate } from "./types/order/sell"
import type { IAcceptBid, IBuy, IFill } from "./types/order/fill"
import type { IBid, IBidUpdate } from "./types/order/bid"
import type { ICancel } from "./types/order/cancel"
import type { ISellInternal } from "./types/order/sell"
import type { IEthereumSdkConfig } from "./sdk-blockchains/ethereum/domain"
import type { IUploadMeta } from "./types/nft/mint/prepare"
import type { IBatchBuy } from "./types/order/fill"
import type { IGetBuyAmmInfo } from "./types/balances"
import type { IGetSdkContext } from "./common/get-sdk-context"
import type { IBalanceTransfer } from "./types/balances"
import type {
  IFlowSetupAccount,
  IFlowCheckInitMattelCollections,
  IFlowSetupMattelCollections,
} from "./types/nft/collection"
import type { ExternalContext } from "./common/get-sdk-context"
import type { IFlowCheckInitGamisodesCollections } from "./types/nft/collection"
import type { IGetBuyTxData } from "./types/ethereum/domain"

export enum LogsLevel {
  DISABLED = 0,
  ERROR = 1,
  TRACE = 2,
}

export interface ISdkContext {
  wallet?: BlockchainWallet
  env: RaribleSdkEnvironment
  config?: IRaribleSdkConfig
  sessionId: string
  apiKey?: string
  providerId?: string
  providerMeta?: Record<string, string>
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
    [WalletType.SOLANA]?: ISolanaSdkConfig
    [WalletType.ETHEREUM]?: IEthereumSdkConfig
    [WalletType.FLOW]?: { auth: AuthWithPrivateKey }
    [WalletType.APTOS]?: AptosSdkConfig
  }
  /**
   * Middlewares
   */
  middlewares?: Middleware[]
  apiKey?: string
  stabilityProtocolApiKey?: string
  stabilityProtocolDestinationAddress?: string
  /**
   * @deprecated
   */
  logger?: AbstractLogger
  /**
   * Pass extra fields to logs
   */
  context?: ExternalContext
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
  flow?: IFlowSdk
  getSdkContext: IGetSdkContext
}

/**
 * Rarible Protocol Apis
 */
export interface IApisSdk {
  order: ApiClient.OrderControllerApi
  currency: ApiClient.CurrencyControllerApi
  collection: ApiClient.CollectionControllerApi
  activity: ApiClient.ActivityControllerApi
  item: ApiClient.ItemControllerApi
  ownership: ApiClient.OwnershipControllerApi
  balances: ApiClient.BalanceControllerApi
  search: ApiClient.SearchControllerApi
  data: ApiClient.DataControllerApi
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
   * * const tx = await sdk.nft.transfer({
   *    itemId: "ETHEREUM:...",
   *    to: "ETHEREUM:0x...",
   *    amount: 1
   * })
   *
   * or with prepare/submit
   *
   * const prepareTransfer = await sdk.nft.transfer.prepare({
   *    itemId: "ETHEREUM:..."
   * })
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
   * const tx = sdk.nft.mint({
   *    tokenId: toTokenId("ETHEREUM:0x...")
   *		uri: "ipfs://..."
   *		supply: 1
   *		lazyMint: false
   *		creators?: [{account: toUnionAddress("ETHEREUM:0x..."), value: 100}]
   *		royalties?: [{account: toUnionAddress("ETHEREUM:0x..."), value: 100}]
   * })
   *
   * or with prepare/submit
   *
   * const prepare = sdk.nft.mint.prepare({tokenId: toTokenId("ETHEREUM:0x...")})
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
   * const tx = sdk.nft.mintAndSell({
   *    tokenId: toTokenId("ETHEREUM:0x...")
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
   *
   * or with prepare/submit
   *
   * const prepare = sdk.nft.mintAndSell.prepare({...})
   * const tx = prepare.submit({
   *		uri: "ipfs://..."
   *	  ...
   * })
   */
  mintAndSell: IMintAndSell
  /**
   * Burn token
   * -
   * @example
   *  const tx = sdk.nft.burn({
   *    itemId: toUnionId("ETHEREUM:0x..."),
   *    amount?: 5,
   *    creators?: [{account: toUnionAddress("ETHEREUM:0x...", value: 100)}]
   *  })
   *
   * or with prepare/submit
   *
   * const prepare = sdk.nft.burn.prepare({itemId: toUnionId("ETHEREUM:0x...")})
   * const tx = prepare.submit({amount?: 5, creators?: [{account: toUnionAddress("ETHEREUM:0x...", value: 100)}]})
   */
  burn: IBurn
  /**
   * Generates a token id (for future minting)
   * -
   * @example
   * const {tokenId, signature} = sdk.nft.generateTokenId({
   * 		collection: toUnionContractAddress("ETHEREUM:0x..."),
   * 		minter: toUnionAddress("ETHEREUM:0x...")},
   * 	)
   *
   */
  generateTokenId: IGenerateTokenId
  /**
   * Create collection - Deploy contract with custom properties
   * -
   * @example
   * const { tx, address } = sdk.nft.createCollection({
   *	blockchain: Blockchain.ETHEREUM,
   *		type: "ERC721",
   *		name: "name",
   *		symbol: "RARI",
   *		baseURI: "https://ipfs.rarible.com",
   *		contractURI: "https://ipfs.rarible.com",
   *		isPublic: true,
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
  buy: IBuy
  /**
   * Confirm item selling by filling bid order
   */
  acceptBid: IAcceptBid
  batchBuy: IBatchBuy
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
  transfer: IBalanceTransfer

  getBiddingBalance: IGetBiddingBalance
  depositBiddingBalance: IDepositBiddingBalance
  withdrawBiddingBalance: IWithdrawBiddingBalance
}

export interface IEthereumSdk {
  wrapCryptoPunk: ICryptopunkWrap
  unwrapCryptoPunk: ICryptopunkUnwrap
  getBatchBuyAmmInfo: IGetBuyAmmInfo
  getBuyTxData: IGetBuyTxData
}

export interface IFlowSdk {
  setupAccount: IFlowSetupAccount
  setupMattelCollections: IFlowSetupMattelCollections
  setupGamisodesCollections: IFlowSetupMattelCollections
  checkInitMattelCollections: IFlowCheckInitMattelCollections
  checkInitGamisodesCollections: IFlowCheckInitGamisodesCollections
}

export type IRaribleInternalSdk = Omit<IRaribleSdk, "order" | "nft" | "apis" | "wallet" | "getSdkContext"> & {
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
