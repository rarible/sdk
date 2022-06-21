import type { Blockchain } from "@rarible/api-client"
import type {
	BasePrepareOrderResponse,
	OrderInternalRequest,
	OrderRequest,
	PrepareOrderRequest,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../common"

/**
 * Create sell order
 * -
 */
export type ISell = (request: PrepareOrderRequest) => Promise<PrepareSellResponse>
export type ISellInternal = (request: PrepareSellInternalRequest) => Promise<PrepareSellInternalResponse>
/**
 * Update sell order
 * -
 */
export type ISellUpdate = (request: PrepareOrderUpdateRequest) => Promise<PrepareOrderUpdateResponse>

export type PrepareSellInternalResponse = BasePrepareOrderResponse<OrderInternalRequest>
export type PrepareSellResponse = BasePrepareOrderResponse<OrderRequest>

export type PrepareSellInternalRequest = {
	/**
   * Blockchain of request
   */
	blockchain: Blockchain
}
