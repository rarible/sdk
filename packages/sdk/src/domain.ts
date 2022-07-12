import type * as ApiClient from "@rarible/api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { BlockchainGroup } from "@rarible/api-client"
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
	IDepositBiddingBalance,
	IGetBiddingBalance,
	IConvert,
	IGetBalance,
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
import type { IEthereumSdkConfig } from "./sdk-blockchains/ethereum/domain"

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
	apiClientParams?: ApiClient.ConfigurationParameters
	logs?: LogsLevel
	blockchain?: {
		[BlockchainGroup.SOLANA]?: ISolanaSdkConfig
		[BlockchainGroup.ETHEREUM]?: IEthereumSdkConfig
		[BlockchainGroup.FLOW]?: { auth: AuthWithPrivateKey }
	}
	middlewares?: Middleware[]
}

export interface IRaribleSdk {
	apis: IApisSdk
	nft: INftSdk
	order: IOrderSdk
	balances: IBalanceSdk
	restriction: IRestrictionSdk
	wallet: Maybe<BlockchainWallet>
	ethereum?: IEthereumSdk
}

export interface IApisSdk {
	order: ApiClient.OrderControllerApi
	currency: ApiClient.CurrencyControllerApi
	auction: ApiClient.AuctionControllerApi
	collection: ApiClient.CollectionControllerApi
	activity: ApiClient.ActivityControllerApi
	item: ApiClient.ItemControllerApi
	ownership: ApiClient.OwnershipControllerApi
}

export interface INftSdk {
	transfer: ITransfer
	preprocessMeta: IPreprocessMeta
	mint: IMint
	mintAndSell: IMintAndSell
	burn: IBurn
	generateTokenId: IGenerateTokenId
	/**
   * @deprecated Use {@link createCollection} instead
   */
	deploy: ICreateCollection
	createCollection: ICreateCollection
	uploadMeta: IUploadMeta
}

export interface IOrderSdk {
	sell: ISell
	sellUpdate: ISellUpdate
	/**
	 * @deprecated Use {@link buy} or {@link acceptBid} instead
	 */
	fill: IFill
	buy: IFill
	acceptBid: IFill
	bid: IBid
	bidUpdate: IBidUpdate
	cancel: ICancel
}

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
