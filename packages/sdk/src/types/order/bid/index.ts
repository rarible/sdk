import type { IBidSimplified, IBidUpdateSimplified } from "./simplified"
import type { IBidPrepare, IBidUpdatePrepare } from "./domain"

export type IBid = IBidSimplified & {
	prepare: IBidPrepare
}

export type IBidUpdate = IBidUpdateSimplified & {
	prepare: IBidUpdatePrepare
}
