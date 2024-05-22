import type { MethodWithPrepare } from "../../common"
import type { IFillPrepare } from "./domain"
import type { IAcceptBidSimplified, IBuySimplified } from "./simplified"
import type { IBatchBuySimplified } from "./domain"
import type { IBatchBuyPrepare } from "./domain"

export type IFill = {
  prepare: IFillPrepare
}

export type IBuy = MethodWithPrepare<IBuySimplified, IFillPrepare>
export type IAcceptBid = MethodWithPrepare<IAcceptBidSimplified, IFillPrepare>
export type IBatchBuy = MethodWithPrepare<IBatchBuySimplified, IBatchBuyPrepare>
