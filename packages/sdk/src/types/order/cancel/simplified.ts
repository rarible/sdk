import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { CancelOrderRequest } from "./domain"

export type ICancelSimplified = (request: CancelOrderRequest) => Promise<IBlockchainTransaction>
