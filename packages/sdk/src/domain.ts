import { ISellSdk } from "./order/sell/domain"

export interface IRaribleSdk {
	nft: {
		sell: ISellSdk
	}
}