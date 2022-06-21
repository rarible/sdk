import { SolanaWallet } from "@rarible/sdk-wallet"
import { toBigNumber } from "@rarible/types"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"

describe("Solana sell", () => {
	const wallet = getWallet(0)
	const buyerWallet = getWallet(1)
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "development", { logs: LogsLevel.DISABLED })
	const buyerSdk = createRaribleSdk(new SolanaWallet(buyerWallet), "development", { logs: LogsLevel.DISABLED })

	test("Should sell NFT item", async () => {
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

		const tx = await retry(10, 4000, async () => {
			const buy = await buyerSdk.order.buy({
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
})
