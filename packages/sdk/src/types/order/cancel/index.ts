import type { MethodWithAction } from "../../common"
import type { ICancelSimplified } from "./simplified"
import type { ICancelAction } from "./domain"

export type ICancel = MethodWithAction<ICancelSimplified, ICancelAction>
