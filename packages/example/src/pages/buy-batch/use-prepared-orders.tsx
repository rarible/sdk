import { useState } from "react"
import type { IRaribleSdk } from "@rarible/sdk/build/domain"
import { PrepareFillBatchRequestWithAmount, PrepareFillRequest } from "@rarible/sdk/src/types/order/fill/domain"
import { PreparedFillBatchRequest } from "@rarible/sdk/build/types/order/fill/domain"

export function usePreparedOrders(sdk?: IRaribleSdk, walletAddress?: string) {
	const [currentOrder, setCurrentOrder] =
		useState<(PreparedFillBatchRequest & { amount?: number }) | null>(null)
	const [orders, setOrders] = useState<(PrepareFillBatchRequestWithAmount & { orderId: string })[]>([])
	const [preparing, setPreparing] = useState(false)
	const [error, setError] = useState<any>(null)

	async function prepareOrder(request: PrepareFillRequest) {
		if (!sdk) {
			console.log("Sdk not defined")
		}
		try {
			setPreparing(true)
			const res = await sdk?.order.prepareOrderForBatchPurchase(request)
			setCurrentOrder(res ?? null)
			setError(false)
		} catch (e: any) {
			if (e.json) {
				setError(await e.json())
			} else {
				setError(e)
			}
		} finally {
			setPreparing(false)
		}
	}

	function setAmountForPreparedOrder(request: PreparedFillBatchRequest, amount: number) {
		setCurrentOrder({
			...request,
			amount,
		})
	}

	function addToBatch(request: PrepareFillBatchRequestWithAmount & { orderId: string }) {
		setOrders(prevState => ([
			...prevState,
			request,
		]))
		setCurrentOrder(null)
	}

	return {
		currentOrder,
		orders,
		preparing,
		error,
		prepareOrder,
		setAmount: setAmountForPreparedOrder,
		addToBatch,
	}
}
