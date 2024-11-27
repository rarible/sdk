import type { OrderId } from "@rarible/api-client"
import type { PrepareOrderRequest } from "../common"
import type { OrderRequest } from "../common"
import type { PrepareOrderUpdateRequest } from "../common"
import type { OrderUpdateRequest } from "../common"

export type ISellSimplified = (request: SellSimplifiedRequest) => Promise<OrderId>
export type SellSimplifiedRequest = Omit<PrepareOrderRequest, "withOriginFees"> & OrderRequest

export type ISellUpdateSimplified = (request: SellUpdateSimplifiedRequest) => Promise<OrderId>
export type SellUpdateSimplifiedRequest = PrepareOrderUpdateRequest & OrderUpdateRequest
