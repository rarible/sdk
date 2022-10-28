import { toBigNumber } from "@rarible/types"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"
import { createSdk } from "../common/test/create-sdk"

describe("Solana sell order update", () => {
	const wallet = getWallet(0)
	const it = awaitAll({
		sdk: createSdk(wallet),
	})

	test("Should set item to sell & change price", async () => {
		const item = await mintToken(it.sdk)
		const itemId = item.id

		const orderId = await retry(10, 4000, async () => {
			const sell = await it.sdk.order.sell.prepare({ itemId })
			return sell.submit({
				amount: 1,
				currency: {
					"@type": "SOLANA_SOL",
				},
				price: toBigNumber("0.001"),
			})
		})

		console.log("orderid", orderId)

		let order = await retry(10, 4000, async () => it.sdk.apis.order.getOrderById({ id: orderId }))
		expect(order.makePrice).toEqual("0.001")

		await retry(10, 4000, async () => {
			const sell = await it.sdk.order.sellUpdate.prepare({ orderId })
			return sell.submit({
				price: toBigNumber("200"),
			})
		})

		order = await retry(10, 4000, async () => {
			const order = await it.sdk.apis.order.getOrderById({ id: orderId })
			if (order.makePrice !== "200") {
				throw new Error("Price didn't update")
			}
			return order
		})
		expect(order.makePrice).toEqual("200")
	})

	test("Should set item to sell & change price with basic functions", async () => {
		const item = await mintToken(it.sdk)
		const itemId = item.id

		const orderId = await retry(10, 4000, async () => {
			return it.sdk.order.sell({
				itemId,
				amount: 1,
				currency: {
					"@type": "SOLANA_SOL",
				},
				price: toBigNumber("0.001"),
			})
		})

		console.log("orderid", orderId)

		let order = await retry(10, 4000, async () => it.sdk.apis.order.getOrderById({ id: orderId }))
		expect(order.makePrice).toEqual("0.001")

		await retry(10, 4000, async () => {
			return it.sdk.order.sellUpdate({
				orderId,
				price: toBigNumber("200"),

			})
		})

		order = await retry(10, 4000, async () => {
			const order = await it.sdk.apis.order.getOrderById({ id: orderId })
			if (order.makePrice !== "200") {
				throw new Error("Price didn't update")
			}
			return order
		})
		expect(order.makePrice).toEqual("200")
	})
})
