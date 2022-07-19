import type { ISellSimplified, ISellUpdateSimplified } from "./simplified"
import type { ISellPrepare } from "./domain"
import type { ISellUpdatePrepare } from "./domain"

export type ISell = ISellSimplified & {
	prepare: ISellPrepare
}

export type ISellUpdate = ISellUpdateSimplified & {
	prepare: ISellUpdatePrepare
}
