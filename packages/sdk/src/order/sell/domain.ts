import {
	PrepareOrderInternalRequest, PrepareOrderInternalResponse,
	PrepareOrderRequest,
	PrepareOrderResponse,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../common"

export type ISell = (request: PrepareOrderRequest) => Promise<PrepareOrderResponse>
export type ISellInternal = (request: PrepareOrderInternalRequest) => Promise<PrepareOrderInternalResponse>
export type ISellUpdate = (request: PrepareOrderUpdateRequest) => Promise<PrepareOrderUpdateResponse>
