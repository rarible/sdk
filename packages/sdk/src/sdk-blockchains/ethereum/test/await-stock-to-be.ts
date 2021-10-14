import { retry } from "@rarible/protocol-ethereum-sdk/build/common/retry"
import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"

export async function awaitStockToBe(sdk: RaribleSdk, hash: string, value: string | number) {
	await retry(3, async () => {
		const o = await sdk.apis.order.getOrderByHash({ hash })
		expect(o.makeStock).toBe(`${value}`)
	})
}
