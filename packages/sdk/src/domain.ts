// import { ISellSdk } from "./order/sell/domain"
import {IMint} from "./nft/mint/domain";

export interface IRaribleSdk {
	nft: {
		// sell: ISellSdk
		mint: IMint
	}
}
