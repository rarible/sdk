import {
	ActivityControllerApi,
	CollectionControllerApi,
	ItemControllerApi,
	OrderControllerApi,
	OwnershipControllerApi,
} from "@rarible/api-client"
import { IMint } from "./types/nft/mint/domain"
import { ISell, ISellInternal, ISellUpdate } from "./types/order/sell/domain"
import { IFill } from "./types/order/fill/domain"
import { IBurn } from "./types/nft/burn/domain"
import { ITransfer } from "./types/nft/transfer/domain"
import { IBid, IBidUpdate } from "./types/order/bid/domain"
import { IMintAndSell } from "./types/nft/mint-and-sell/domain"
import { ICancel } from "./types/order/cancel/domain"
import { IGetBalance } from "./types/balances"

export interface IRaribleSdk {
	apis: IApisSdk,
	nft: INftSdk,
	order: IOrderSdk,
	balances: IBalanceSdk
}

export interface IApisSdk {
	order: OrderControllerApi,
	collection: CollectionControllerApi,
	activity: ActivityControllerApi,
	item: ItemControllerApi,
	ownership: OwnershipControllerApi
}

export interface INftSdk {
	transfer: ITransfer,
	mint: IMint,
	mintAndSell: IMintAndSell,
	burn: IBurn,
}

export interface IOrderSdk {
	sell: ISell,
	sellUpdate: ISellUpdate,
	fill: IFill,
	bid: IBid,
	bidUpdate: IBidUpdate,
	cancel: ICancel,
}

export interface IBalanceSdk {
	getBalance: IGetBalance
}

export type IRaribleInternalSdk = Omit<IRaribleSdk, "order" | "nft" | "apis"> & {
	nft: Omit<INftSdk, "mintAndSell">
	order: Omit<IOrderSdk, "sell"> & {
		sell: ISellInternal,
	},
	balances: IBalanceSdk
}
