import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { CancelOrderRequest } from "./domain"

export type ICancel = (request: CancelOrderRequest) => Promise<IBlockchainTransaction>
