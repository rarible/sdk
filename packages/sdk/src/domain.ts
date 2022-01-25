import type * as ApiClient from "@rarible/api-client"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { IMint } from "./types/nft/mint/domain"
import type { ISell, ISellInternal, ISellUpdate } from "./types/order/sell/domain"
import type { IFill } from "./types/order/fill/domain"
import type { IBurn } from "./types/nft/burn/domain"
import type { ITransfer } from "./types/nft/transfer/domain"
import type { IBid, IBidUpdate } from "./types/order/bid/domain"
import type { IMintAndSell } from "./types/nft/mint-and-sell/domain"
import type { ICancel } from "./types/order/cancel/domain"
import type { IGetBalance } from "./types/balances"
import type { IGenerateTokenId } from "./types/nft/generate-token-id"
import type { IDeploy } from "./types/nft/deploy/domain"
import type { IRestrictionSdk } from "./types/nft/restriction/domain"
import type { IPreprocessMeta } from "./types/nft/mint/preprocess-meta"
import type { Middleware } from "./common/middleware/middleware"
import type { RaribleSdkEnvironment } from "./config/domain"
import type { IAuctionStart } from "./types/auction/start"
import type { IAuctionCancel } from "./types/auction/cancel"
import type { IAuctionFinish } from "./types/auction/finish"
import type { IAuctionPutBid } from "./types/auction/put-bid"
import type { IAuctionBuyOut } from "./types/auction/buy-out"

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
	middlewares?: Middleware[]
}

export interface IRaribleSdk {
	apis: IApisSdk
	nft: INftSdk
	order: IOrderSdk
	balances: IBalanceSdk
	auction: IAuctionSdk
	restriction: IRestrictionSdk
}

export interface IApisSdk {
	order: ApiClient.OrderControllerApi
	collection: ApiClient.CollectionControllerApi
	activity: ApiClient.ActivityControllerApi
	item: ApiClient.ItemControllerApi
	ownership: ApiClient.OwnershipControllerApi
	auction: ApiClient.AuctionControllerApi
}

export interface INftSdk {
	transfer: ITransfer
	preprocessMeta: IPreprocessMeta
	mint: IMint
	mintAndSell: IMintAndSell
	burn: IBurn
	generateTokenId: IGenerateTokenId
	deploy: IDeploy
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
}

export type IRaribleInternalSdk = Omit<IRaribleSdk, "order" | "nft" | "apis"> & {
	nft: INftInternalSdk
	order: IOrderInternalSdk
	auction: IAuctionSdk
	balances: IBalanceSdk
}

export type INftInternalSdk = Omit<INftSdk, "mintAndSell"> & {
	generateTokenId: IGenerateTokenId
}

export type IOrderInternalSdk = Omit<IOrderSdk, "sell"> & {
	sell: ISellInternal
}

export interface IAuctionSdk {
	start: IAuctionStart
	cancel: IAuctionCancel
	finish: IAuctionFinish
	putBid: IAuctionPutBid
	buyOut: IAuctionBuyOut
}
