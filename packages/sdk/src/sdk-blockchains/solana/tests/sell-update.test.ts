import { toBigNumber } from "@rarible/types"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"
import { createSdk } from "../common/test/create-sdk"

describe("Solana sell order update", () => {
	const wallet = getWallet(0)
	const sdk = createSdk(wallet)

	test("Should set item to sell & change price", async () => {
		const item = await mintToken(sdk)
		const itemId = item.id

		const orderId = await retry(10, 4000, async () => {
			const sell = await sdk.order.sell({ itemId })
			return sell.submit({
				amount: 1,
				currency: {
					"@type": "SOLANA_SOL",
				},
				price: toBigNumber("0.001"),
			})
		})

		console.log("orderid", orderId)

		let order = await retry(10, 4000, async () => sdk.apis.order.getOrderById({ id: orderId }))
		expect(order.makePrice).toEqual("0.001")

		await retry(10, 4000, async () => {
			const sell = await sdk.order.sellUpdate({ orderId })
			return sell.submit({
				price: toBigNumber("200"),
			})
		})

		order = await retry(10, 4000, async () => {
			const order = await sdk.apis.order.getOrderById({ id: orderId })
			if (order.makePrice !== "200") {
				throw new Error("Price didn't update")
			}
			return order
		})
		expect(order.makePrice).toEqual("200")
	})
})
