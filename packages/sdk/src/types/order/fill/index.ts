import type { SimplifiedWithPrepareClass } from "../../common"
import type { IFillPrepare } from "./domain"
import type { IAcceptBidSimplified, IBuySimplified } from "./simplified"

export type IFill = {
	prepare: IFillPrepare
}

export type IBuy = SimplifiedWithPrepareClass<IBuySimplified, IFillPrepare>
export type IAcceptBid = SimplifiedWithPrepareClass<IAcceptBidSimplified, IFillPrepare>
