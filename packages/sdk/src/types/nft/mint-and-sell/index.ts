import type { MethodWithPrepareGeneral } from "../../common"
import type { IMintAndSellSimplified } from "./simplified"
import type { IMintAndSellPrepare } from "./domain"

export type IMintAndSell = MethodWithPrepareGeneral<IMintAndSellSimplified["mintAndSell"], IMintAndSellPrepare>
