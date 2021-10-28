import { PrepareOrderRequest, PrepareOrderResponse } from "../common"

export type ISell = (request: PrepareOrderRequest) => Promise<PrepareOrderResponse>
