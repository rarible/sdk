import type { SimplifiedWithActionClass } from "../../common"
import type { ICancelSimplified } from "./simplified"
import type { ICancelAction } from "./domain"

export type ICancel = SimplifiedWithActionClass<ICancelSimplified, ICancelAction>
