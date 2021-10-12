import { IMint } from "./nft/mint/domain"
import { ISell } from "./order/sell/domain"

export interface IRaribleSdk {
	nft: {
		mint: IMint
	},
	order: {
		sell: ISell
	}
}
