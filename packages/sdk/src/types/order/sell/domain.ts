import type { Blockchain } from "@rarible/api-client"
import type {
	PrepareOrderRequest,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../common"
import type { BasePrepareOrderResponse } from "../common"
import type { OrderInternalRequest } from "../common"
import type { OrderRequest } from "../common"

export type ISell = (request: PrepareOrderRequest) => Promise<PrepareSellResponse>
export type ISellInternal = (request: PrepareSellInternalRequest) => Promise<PrepareSellInternalResponse>
export type ISellUpdate = (request: PrepareOrderUpdateRequest) => Promise<PrepareOrderUpdateResponse>

export type PrepareSellInternalResponse = BasePrepareOrderResponse<OrderInternalRequest>
export type PrepareSellResponse = BasePrepareOrderResponse<OrderRequest>

export type PrepareSellInternalRequest = {
	/**
   * Blockchain of request
   */
	blockchain: Blockchain
}
