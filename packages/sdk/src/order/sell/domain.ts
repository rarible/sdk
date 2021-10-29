import {
	PrepareOrderRequest,
	PrepareOrderResponse,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../common"

export type ISell = (request: PrepareOrderRequest) => Promise<PrepareOrderResponse>
export type ISellUpdate = (request: PrepareOrderUpdateRequest) => Promise<PrepareOrderUpdateResponse>
