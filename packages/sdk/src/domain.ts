import { IMint } from "./nft/mint/domain"
import { ISell } from "./order/sell/domain"
import { IFill } from "./order/fill/domain"
import { IBurn } from "./nft/burn/domain"

export interface IRaribleSdk {
	nft: {
		mint: IMint,
		burn: IBurn,
	},
	order: {
		sell: ISell,
		fill: IFill
	}
}
