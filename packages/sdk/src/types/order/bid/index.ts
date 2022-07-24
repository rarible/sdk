import type { MethodWithPrepare } from "../../common"
import type { IBidSimplified, IBidUpdateSimplified } from "./simplified"
import type { IBidPrepare, IBidUpdatePrepare } from "./domain"

export type IBid = MethodWithPrepare<IBidSimplified, IBidPrepare>
export type IBidUpdate = MethodWithPrepare<IBidUpdateSimplified, IBidUpdatePrepare>
