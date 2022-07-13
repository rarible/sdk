import { toBigNumber, toItemId } from "@rarible/types"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"
import { createSdk } from "../common/test/create-sdk"

describe("Solana cancel", () => {
	const wallet = getWallet(0)
	const sdk = createSdk(wallet)

	test("Should cancel NFT selling", async () => {
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

		const cancelTx = await retry(10, 4000, () => sdk.order.cancel({
			orderId,
		}))

		expect(cancelTx.hash()).toBeTruthy()
		await cancelTx.wait()
	})


	test("Should cancel multiple NFT order", async () => {
		const itemId = toItemId("SOLANA:7axrWQBXRQosdoz99Wo8JM3SnEMbh5wk8tcjJTP38nHt")

		const orderId = await retry(10, 1000, async () => {
			const sell = await sdk.order.sell({ itemId })
			return sell.submit({
				amount: 10,
				currency: {
					"@type": "SOLANA_SOL",
				},
				price: toBigNumber("0.001"),
			})
		})

		const cancelTx = await retry(10, 4000, () => sdk.order.cancel({
			orderId,
		}))

		expect(cancelTx.hash()).toBeTruthy()
		await cancelTx.wait()
	})
})
