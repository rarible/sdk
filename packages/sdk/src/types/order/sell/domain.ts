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
 * @param {PrepareOrderRequest} request
 * @returns {Promise<PrepareSellResponse>}
 * @example
 * 		const sellAction = await sdk.order.sell({ itemId: toItemId("ETHEREUM:0x...") })
 * 		const orderId = await sellAction.submit({
 *			amount: 1,
 *			price: "0.000000000000000002",
 *			currency: {
 *				"@type": "ERC20",
 *				contract: toContractAddress(`ETHEREUM:0x`),
 *			},
 *			expirationDate: new Date(Date.now() + 200000),
 *		})
 */
export type ISell = (request: PrepareOrderRequest) => Promise<PrepareSellResponse>
export type ISellInternal = (request: PrepareSellInternalRequest) => Promise<PrepareSellInternalResponse>
/**
 * Update sell order
 * @param {PrepareOrderUpdateRequest} request
 * @returns {Promise<PrepareOrderUpdateResponse>}
 * @example
 * 		import { toOrderId, toBigNumber } from "@rarible/types"
 * 		const sellUpdateAction = await sdk.order.sellUpdate({ orderId: toOrderId("ETHEREUM:0x...") })
 * 		const orderId = await sellUpdateAction.submit({
 *			price: toBigNumber("0.000000000000000002"),
 *		})
 */
export type ISellUpdate = (request: PrepareOrderUpdateRequest) => Promise<PrepareOrderUpdateResponse>

export type PrepareSellInternalResponse = BasePrepareOrderResponse<OrderInternalRequest>
/**
 * Prepare sell response
 */
export type PrepareSellResponse = BasePrepareOrderResponse<OrderRequest>

export type PrepareSellInternalRequest = {
	/**
   * Blockchain of request
   */
	blockchain: Blockchain
}
