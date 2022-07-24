import type { MethodWithPrepare } from "../../common"
import type { ITransferSimplified } from "./simplified"
import type { ITransferPrepare } from "./domain"

export type ITransfer = MethodWithPrepare<ITransferSimplified, ITransferPrepare>
