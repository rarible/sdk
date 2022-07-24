import type { MethodWithPrepare } from "../../common"
import type { ISellSimplified, ISellUpdateSimplified } from "./simplified"
import type { ISellPrepare } from "./domain"
import type { ISellUpdatePrepare } from "./domain"
import type { ISellInternalPrepare } from "./domain"

export type ISell = MethodWithPrepare<ISellSimplified, ISellPrepare>
export type ISellInternal = MethodWithPrepare<ISellSimplified, ISellInternalPrepare>
export type ISellUpdate = MethodWithPrepare<ISellUpdateSimplified, ISellUpdatePrepare>
