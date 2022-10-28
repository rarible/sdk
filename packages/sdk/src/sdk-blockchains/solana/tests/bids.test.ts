import { toBigNumber } from "@rarible/types"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"
import { createSdk } from "../common/test/create-sdk"

describe("Solana bid", () => {
	const wallet = getWallet(0)
	const buyerWallet = getWallet(1)

	const it = awaitAll({
		sdk: createSdk(wallet),
		buyerSdk: createSdk(buyerWallet),
	})

	test("Should bid & accept", async () => {
		const item = await mintToken(it.sdk)
		const itemId = item.id

		const orderId = await retry(10, 4000, async () => {
			const bid = await it.buyerSdk.order.bid.prepare({ itemId })
			return bid.submit({
				amount: 1,
				currency: {
					"@type": "SOLANA_SOL",
				},
				price: toBigNumber("0.001"),
			})
		})

		await retry(10, 4000, async () => {
			const accept = await it.sdk.order.acceptBid.prepare({
				orderId,
			})
			return accept.submit({
				amount: 1,
				itemId,
			})
		})
	})

	test("Should bid & updateBid", async () => {
		const item = await mintToken(it.sdk)
		const itemId = item.id

		const orderId = await retry(10, 4000, async () => {
			const bid = await it.buyerSdk.order.bid.prepare({ itemId })
			return bid.submit({
				amount: 1,
				currency: {
					"@type": "SOLANA_SOL",
				},
				price: toBigNumber("0.001"),
			})
		})

		await retry(10, 4000, async () => {
			const update = await it.buyerSdk.order.bidUpdate.prepare({ orderId })
			return update.submit({
				price: toBigNumber("0.003"),
			})
		})

		const order = await retry(10, 4000, async () => {
			const order = await it.sdk.apis.order.getOrderById({ id: orderId })
			if (order.make.value !== "0.003") {
				throw new Error("Wrong bid value")
			}
			return order
		})

		expect(order.make.value.toString()).toEqual("0.003")
	})

	test("Should bid & updateBid", async () => {
		const item = await mintToken(it.sdk)
		const itemId = item.id

		const orderId = await retry(10, 4000, async () => {
			const bid = await it.buyerSdk.order.bid.prepare({ itemId })
			return bid.submit({
				amount: 1,
				currency: {
					"@type": "SOLANA_SOL",
				},
				price: toBigNumber("0.001"),
			})
		})

		await retry(10, 4000, async () => {
			const update = await it.buyerSdk.order.bidUpdate.prepare({ orderId })
			return update.submit({
				price: toBigNumber("0.003"),
			})
		})

		const order = await retry(10, 4000, async () => {
			const order = await it.sdk.apis.order.getOrderById({ id: orderId })
			if (order.make.value !== "0.003") {
				throw new Error("Wrong bid value")
			}
			return order
		})

		expect(order.make.value.toString()).toEqual("0.003")
	})

	test("Should bid & accept with basic functions", async () => {
		const item = await mintToken(it.sdk)
		const itemId = item.id

		const orderId = await retry(10, 4000, async () => {
			return it.buyerSdk.order.bid({
				itemId,
				amount: 1,
				currency: {
					"@type": "SOLANA_SOL",
				},
				price: toBigNumber("0.001"),
			})
		})

		const tx = await retry(10, 4000, async () => {
			return it.sdk.order.acceptBid({
				orderId,
				amount: 1,
				itemId,
			})

		})

		expect(tx.hash()).toBeTruthy()
		await tx.wait()
	})
})
