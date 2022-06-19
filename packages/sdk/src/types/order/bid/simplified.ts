import type { OrderId } from "@rarible/api-client"
import type { OrderRequest } from "../common"
import type { OrderUpdateRequest, PrepareOrderUpdateRequest } from "../common"
import type { PrepareBidRequest } from "./domain"

export type IBidSimplified = (request: BidSimplifiedRequest) => Promise<OrderId>
export type BidSimplifiedRequest = PrepareBidRequest & OrderRequest

export type IBidUpdateSimplified = (request: BidUpdateSimplifiedRequest) => Promise<OrderId>
export type BidUpdateSimplifiedRequest = PrepareOrderUpdateRequest & OrderUpdateRequest
