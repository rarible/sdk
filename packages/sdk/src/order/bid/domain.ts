import { PrepareOrderRequest, PrepareOrderResponse } from "../common"

export type IBid = (request: PrepareOrderRequest) => Promise<PrepareOrderResponse>
