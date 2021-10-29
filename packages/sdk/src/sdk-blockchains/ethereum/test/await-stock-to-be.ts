import { retry } from "@rarible/protocol-ethereum-sdk/build/common/retry"
import { OrderId } from "@rarible/api-client"
import { IRaribleSdk } from "../../../domain"

export async function awaitStockToBe(sdk: IRaribleSdk, id: OrderId, value: string | number) {
	await retry(3, async () => {
		const o = await sdk.apis.order.getOrderById({ id })
		expect(`${o.makeStock}`).toBe(`${value}`)
	})
}
