import { IMint } from "./nft/mint/domain"

export interface IRaribleSdk {
	nft: {
		mint: IMint
	}
}
