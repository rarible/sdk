import type { SimplifiedWithPrepareClass } from "../../common"
import type { IBidSimplified, IBidUpdateSimplified } from "./simplified"
import type { IBidPrepare, IBidUpdatePrepare } from "./domain"

export type IBid = SimplifiedWithPrepareClass<IBidSimplified, IBidPrepare>
export type IBidUpdate = SimplifiedWithPrepareClass<IBidUpdateSimplified, IBidUpdatePrepare>
