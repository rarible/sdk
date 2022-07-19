import type { IMintAndSellSimplified } from "./simplified"
import type { IMintAndSellPrepare } from "./domain"

export type IMintAndSell = IMintAndSellSimplified["mintAndSell"] & {
	prepare: IMintAndSellPrepare
}
