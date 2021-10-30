import {
	ActivityControllerApi,
	CollectionControllerApi,
	ItemControllerApi,
	OrderControllerApi,
	OwnershipControllerApi,
} from "@rarible/api-client"
import { IMint } from "./nft/mint/domain"
import { ISell, ISellInternal, ISellUpdate } from "./order/sell/domain"
import { IFill } from "./order/fill/domain"
import { IBurn } from "./nft/burn/domain"
import { ITransfer } from "./nft/transfer/domain"
import { IBid, IBidUpdate } from "./order/bid/domain"
import { IMintAndSell } from "./nft/mint-and-sell/domain"

export interface IRaribleSdk {
	apis: {
		order: OrderControllerApi,
		collection: CollectionControllerApi,
		activity: ActivityControllerApi,
		item: ItemControllerApi,
		ownership: OwnershipControllerApi
	}
	nft: INftSdk,
	order: IOrderSdk
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
}

export type IRaribleInternalSdk = Omit<IRaribleSdk, "order" | "nft" | "apis"> & {
	nft: Omit<INftSdk, "mintAndSell">
	order: Omit<IOrderSdk, "sell"> & {
		sell: ISellInternal,
	},
}
