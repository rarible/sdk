import type { SimplifiedWithPrepareClass } from "../../common"
import type { IBurnSimplified } from "./simplified"
import type { IBurnPrepare } from "./domain"

export type IBurn = SimplifiedWithPrepareClass<IBurnSimplified, IBurnPrepare>
