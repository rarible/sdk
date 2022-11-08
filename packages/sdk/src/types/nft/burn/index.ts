import type { MethodWithPrepare } from "../../common"
import type { IBurnSimplified } from "./simplified"
import type { IBurnPrepare } from "./domain"

export type IBurn = MethodWithPrepare<IBurnSimplified, IBurnPrepare>
