import type { Order, OrderId } from "@rarible/api-client"
import type { Platform } from "@rarible/api-client/build/models/Platform"

export type PrepareFillRequest = {
	/**
	 * Order identifier to fill
	 */
	orderId: OrderId
} | {
	/**
	 * Order to fill
	 */
	order: Order
}

export type BuyNftResponse = {
	status: "loading"
} | {
	status: "done"
	maxAmount?: number
	baseFee: number
	platform: Platform
	submit(amount: number): void
} | {
	status: "error"
	error?: any
}

export function useBuyNft(request: PrepareFillRequest): BuyNftResponse {
	return null as any
}