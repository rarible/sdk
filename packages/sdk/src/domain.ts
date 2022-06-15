import type * as ApiClient from "@rarible/api-client"
import type { BlockchainGroup } from "@rarible/api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { EthereumNetworkConfig } from "@rarible/protocol-ethereum-sdk/build/types"
import type { AuthWithPrivateKey } from "@rarible/flow-sdk/build/types"
import type { IMint } from "./types/nft/mint/domain"
import type { ISell, ISellInternal, ISellUpdate } from "./types/order/sell/domain"
import type { IFill } from "./types/order/fill/domain"
import type { IBurn } from "./types/nft/burn/domain"
import type { ITransfer } from "./types/nft/transfer/domain"
import type { IBid, IBidUpdate } from "./types/order/bid/domain"
import type { IMintAndSell } from "./types/nft/mint-and-sell/domain"
import type { ICancel } from "./types/order/cancel/domain"
import type { IConvert, IGetBalance } from "./types/balances"
import type { IGenerateTokenId } from "./types/nft/generate-token-id"
import type { ICreateCollection } from "./types/nft/deploy/domain"
import type { IRestrictionSdk } from "./types/nft/restriction/domain"
import type { IPreprocessMeta } from "./types/nft/mint/preprocess-meta"
import type { Middleware } from "./common/middleware/middleware"
import type { RaribleSdkEnvironment } from "./config/domain"
import type { ICryptopunkUnwrap, ICryptopunkWrap } from "./types/ethereum/domain"
import type { ISolanaSdkConfig } from "./sdk-blockchains/solana/domain"
import type { ICreateCollectionSimplified } from "./types/nft/deploy/simplified"
import type { IMintSimplified } from "./types/nft/mint/simplified"
import type { IMintAndSellSimplified } from "./types/nft/mint-and-sell/simplified"
import type { ISellSimplified } from "./types/order/sell/simplified"
import type { IBurnSimplified } from "./types/nft/burn/simplified"

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
	}
	middlewares?: Middleware[]
	ethereum?: EthereumNetworkConfig
	polygon?: EthereumNetworkConfig
	flow?: { auth: AuthWithPrivateKey }
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
	mintStart: IMintSimplified["mintStart"]
	mintAndSell: IMintAndSell
	mintAndSellStart: IMintAndSellSimplified["mintAndSellStart"]
	burn: IBurn
	burnStart: IBurnSimplified
	generateTokenId: IGenerateTokenId
	/**
   * @deprecated Use {@link createCollection} instead
   */
	deploy: ICreateCollection
	createCollection: ICreateCollection
	createCollectionStart: ICreateCollectionSimplified
}

export interface IOrderSdk {
	sell: ISell
	sellUpdate: ISellUpdate
	sellStart: ISellSimplified
	/**
	 * @deprecated Use {@link buy} or {@link acceptBid} instead
	 */
	fill: IFill
	buy: IFill
	buyStart: IFill
	acceptBid: IFill
	acceptBidStart: IFill
	bid: IBid
	bidStart: IBid
	bidUpdate: IBidUpdate
	bidUpdateStart: IBidUpdate
	cancel: ICancel
	cancelStart: ICancel
}

export interface IBalanceSdk {
	getBalance: IGetBalance
	convert: IConvert
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
