import type * as ApiClient from "@rarible/api-client"
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

export interface IRaribleSdk {
	apis: IApisSdk
	nft: INftSdk
	order: IOrderSdk
	balances: IBalanceSdk
}

export interface IApisSdk {
	order: ApiClient.OrderControllerApi
	collection: ApiClient.CollectionControllerApi
	activity: ApiClient.ActivityControllerApi
	item: ApiClient.ItemControllerApi
	ownership: ApiClient.OwnershipControllerApi
}

export interface INftSdk {
	transfer: ITransfer
	mint: IMint
	mintAndSell: IMintAndSell
	burn: IBurn
	generateTokenId: IGenerateTokenId
}

export interface IOrderSdk {
	sell: ISell
	sellUpdate: ISellUpdate
	fill: IFill
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
	balances: IBalanceSdk
}

export type INftInternalSdk = Omit<INftSdk, "mintAndSell"> & {
	generateTokenId: IGenerateTokenId
}

export type IOrderInternalSdk = Omit<IOrderSdk, "sell"> & {
	sell: ISellInternal
}
