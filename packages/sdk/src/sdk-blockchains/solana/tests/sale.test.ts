import { toBigNumber } from "@rarible/types"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"
import { createSdk } from "../common/test/create-sdk"

describe("Solana sell", () => {
	const wallet = getWallet(0)
	const buyerWallet = getWallet(1)
	const it = awaitAll({
		sdk: createSdk(wallet),
		buyerSdk: createSdk(buyerWallet),
	})

	test("Should sell NFT item", async () => {
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

		const tx = await retry(10, 4000, async () => {
			const buy = await it.buyerSdk.order.buy.prepare({
				orderId,
			})

			return buy.submit({
				amount: 1,
				itemId,
			})
		})

		expect(tx.hash()).toBeTruthy()
		await tx.wait()
	})

	test("Should sell NFT item with basic function", async () => {
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

		const tx = await retry(10, 4000, async () => {
			return it.buyerSdk.order.buy({
				orderId,
				amount: 1,
				itemId,
			})
		})

		expect(tx.hash()).toBeTruthy()
		await tx.wait()
	})
})
