import type { IFillPrepare } from "./domain"
import type { IAcceptBidSimplified, IBuySimplified } from "./simplified"

export type IFill = {
	prepare: IFillPrepare
}

export type IBuy = IBuySimplified & {
	prepare: IFillPrepare
}

export type IAcceptBid = IAcceptBidSimplified & {
	prepare: IFillPrepare
}
