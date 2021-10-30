import {
	ActivityControllerApi,
	CollectionControllerApi,
	ItemControllerApi,
	OrderControllerApi,
	OwnershipControllerApi,
} from "@rarible/api-client"
import { IMint } from "./nft/mint/domain"
import { ISell, ISellUpdate } from "./order/sell/domain"
import { IFill } from "./order/fill/domain"
import { IBurn } from "./nft/burn/domain"
import { ITransfer } from "./nft/transfer/domain"
import { IBid, IBidUpdate } from "./order/bid/domain"

export interface IRaribleSdk {
	apis: {
		order: OrderControllerApi,
		collection: CollectionControllerApi,
		activity: ActivityControllerApi,
		item: ItemControllerApi,
		ownership: OwnershipControllerApi
	}
	nft: {
		transfer: ITransfer,
		mint: IMint,
		burn: IBurn,
	},
	order: {
		sell: ISell,
		sellUpdate: ISellUpdate,
		fill: IFill,
		bid: IBid,
		bidUpdate: IBidUpdate,
	}
}
