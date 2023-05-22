import type { OrderId } from "@rarible/api-client"
import type { PrepareFillRequest } from "../../types/order/fill/domain"

export function getOrderIdFromFillRequest(req?: PrepareFillRequest): OrderId | undefined {
	if (!req) return undefined
	if ("orderId" in req) {
		return req?.orderId
	} else if ("order" in req) {
		return req?.order?.id
	}
}
