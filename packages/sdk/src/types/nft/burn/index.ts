import type { IBurnSimplified } from "./simplified"
import type { IBurnPrepare } from "./domain"

export type IBurn = IBurnSimplified & {
	prepare: IBurnPrepare
}
