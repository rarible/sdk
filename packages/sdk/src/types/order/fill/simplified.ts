import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { PrepareFillRequest } from "./domain"
import type { FillRequest } from "./domain"

export type IAcceptBidSimplified = (request: AcceptBidSimplifiedRequest) => Promise<IBlockchainTransaction>
export type AcceptBidSimplifiedRequest = PrepareFillRequest & FillRequest

export type IBuySimplified = (request: BuySimplifiedRequest) => Promise<IBlockchainTransaction>
export type BuySimplifiedRequest = PrepareFillRequest & Omit<FillRequest, "unwrap">
