import type { SimplifiedWithPrepareClass } from "../../common"
import type { ISellSimplified, ISellUpdateSimplified } from "./simplified"
import type { ISellPrepare } from "./domain"
import type { ISellUpdatePrepare } from "./domain"
import type { ISellInternalPrepare } from "./domain"

export type ISell = SimplifiedWithPrepareClass<ISellSimplified, ISellPrepare>
export type ISellInternal = SimplifiedWithPrepareClass<ISellSimplified, ISellInternalPrepare>
export type ISellUpdate = SimplifiedWithPrepareClass<ISellUpdateSimplified, ISellUpdatePrepare>
