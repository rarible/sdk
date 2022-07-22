import type { SimplifiedWithPrepareClassGeneral } from "../../common"
import type { IMintAndSellSimplified } from "./simplified"
import type { IMintAndSellPrepare } from "./domain"

export type IMintAndSell = SimplifiedWithPrepareClassGeneral<IMintAndSellSimplified["mintAndSell"], IMintAndSellPrepare>
