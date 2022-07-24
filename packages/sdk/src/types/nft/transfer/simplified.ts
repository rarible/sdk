import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { PrepareTransferRequest, TransferRequest } from "./domain"

export type ITransferSimplified = (request: TransferSimplifiedRequest) => Promise<IBlockchainTransaction>
export type TransferSimplifiedRequest = PrepareTransferRequest & TransferRequest
