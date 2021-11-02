import { retry } from "@rarible/protocol-ethereum-sdk/build/common/retry"
import { OrderId } from "@rarible/api-client"
import { IRaribleSdk } from "../../../domain"
import { logTime } from "../../../common/log-time"

export async function awaitStockToBe(sdk: IRaribleSdk, id: OrderId, value: string | number) {
	await logTime(`awaiting stock of ${id} to be ${value}`, async () => {
		await retry(3, async () => {
			const o = await sdk.apis.order.getOrderById({ id })
			console.log(o)
			expect(`${o.makeStock}`).toBe(`${value}`)
		})
	})
}
