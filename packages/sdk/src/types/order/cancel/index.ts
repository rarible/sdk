import type { ICancelSimplified } from "./simplified"
import type { ICancelAction } from "./domain"

export type ICancel = ICancelSimplified & {
	action: ICancelAction
}
