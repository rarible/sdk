import { toBigNumber } from "@rarible/types"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"
import { createSdk } from "../common/test/create-sdk"

describe("Solana bid", () => {
	const wallet = getWallet(0)
	const buyerWallet = getWallet(1)
	const sdk = createSdk(wallet)
	const buyerSdk = createSdk(buyerWallet)

	test("Should bid & accept", async () => {
		const item = await mintToken(sdk)
		const itemId = item.id

		const orderId = await retry(10, 4000, async () => {
			const bid = await buyerSdk.order.bid({ itemId })
			return bid.submit({
				amount: 1,
				currency: {
					"@type": "SOLANA_SOL",
				},
				price: toBigNumber("0.001"),
			})
		})

		const tx = await retry(10, 4000, async () => {
			const accept = await sdk.order.acceptBid({
				orderId,
			})

			return accept.submit({
				amount: 1,
				itemId,
			})
		})

		expect(tx.hash()).toBeTruthy()
		await tx.wait()
	})

	test("Should bid & updateBid", async () => {
		const item = await mintToken(sdk)
		const itemId = item.id

		const orderId = await retry(10, 4000, async () => {
			const bid = await buyerSdk.order.bid({ itemId })
			return bid.submit({
				amount: 1,
				currency: {
					"@type": "SOLANA_SOL",
				},
				price: toBigNumber("0.001"),
			})
		})

		await retry(10, 4000, async () => {
			const update = await buyerSdk.order.bidUpdate({ orderId })
			return update.submit({
				price: toBigNumber("0.003"),
			})
		})

		const order = await retry(10, 4000, async () => {
			const order = await sdk.apis.order.getOrderById({ id: orderId })
			if (order.make.value !== "0.003") {
				throw new Error("Wrong bid value")
			}
			return order
		})

		expect(order.make.value.toString()).toEqual("0.003")
	})
})
