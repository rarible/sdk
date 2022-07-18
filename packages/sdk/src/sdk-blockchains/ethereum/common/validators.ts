import type * as OrderCommon from "../../../types/order/common"
import type { FillRequest } from "../../../types/order/fill/domain"

export function validateOrderDataV3Request(request: OrderCommon.OrderRequest | FillRequest, options?: {
	shouldProvideMaxFeesBasePoint?: boolean
}) {
	if (
		options?.shouldProvideMaxFeesBasePoint &&
		(
			(!request.maxFeesBasePoint || request.maxFeesBasePoint <= 0) ||
			(request.maxFeesBasePoint > 1000)
		)
	) {
		throw new Error("maxFeesBasePoint should be specified in request and should be more than 0% and can't be more than 10%")
	}
	if (request.payouts && request.payouts.length > 1) {
		throw new Error("Only 1 payout account maximum supported")
	}
	if (request.originFees && request.originFees.length > 2) {
		throw new Error("Only 2 origin accounts maximum supported")
	}
}
