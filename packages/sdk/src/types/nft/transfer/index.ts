import type { SimplifiedWithPrepareClass } from "../../common"
import type { ITransferSimplified } from "./simplified"
import type { ITransferPrepare } from "./domain"

export type ITransfer = SimplifiedWithPrepareClass<ITransferSimplified, ITransferPrepare>
