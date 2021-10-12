import { IMint } from "./nft/mint/domain"
import { IFill } from "./order/fill/domain"

export interface IRaribleSdk {
	nft: {
		mint: IMint
	},
	order: {
		fill: IFill
	}
}
