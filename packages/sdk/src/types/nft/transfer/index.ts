import type { ITransferSimplified } from "./simplified"
import type { ITransferPrepare } from "./domain"

export type ITransfer = ITransferSimplified & {
	prepare: ITransferPrepare
}
