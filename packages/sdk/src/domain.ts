import { IMint } from "./nft/mint/domain"
import { ISell } from "./order/sell/domain"
import { IFill } from "./order/fill/domain"
import { IBid } from "./order/bid/domain"

export interface IRaribleSdk {
	nft: {
		mint: IMint,
	},
	order: {
		sell: ISell,
		fill: IFill,
		bid: IBid,
	}
}
