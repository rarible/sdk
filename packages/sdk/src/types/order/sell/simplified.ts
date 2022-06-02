import type { OrderId } from "@rarible/api-client"
import type { PrepareOrderRequest } from "../common"
import type { OrderRequest } from "../common"

export type ISellSimplified = (request: SellSimplifiedRequest) => Promise<OrderId>

export type SellSimplifiedRequest = PrepareOrderRequest & OrderRequest
