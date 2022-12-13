import { toBigNumber, toUnionAddress } from "@rarible/types"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"
import { createSdk } from "../common/test/create-sdk"

describe("Solana sell scenarios", () => {
	const wallet = getWallet(0)
	const wallet2 = getWallet(1)
	const it = awaitAll({
		sdk: createSdk(wallet),
		sdkSecond: createSdk(wallet2),
	})

	test("Should set item to sell then transfer then buy", async () => {
		const item = await mintToken(it.sdk)
		const itemId = item.id

		// wallet1 sell
		await retry(10, 4000, async () => {
			const sell = await it.sdk.order.sell.prepare({ itemId })
			return sell.submit({
				amount: 1,
				currency: { "@type": "SOLANA_SOL" },
				price: toBigNumber("0.001"),
			})
		})

		// wallet1 transfer
		const transferTx = await retry(10, 4000, async () => {
			const sell = await it.sdk.nft.transfer.prepare({ itemId })
			return sell.submit({
				amount: 1,
				to: toUnionAddress("SOLANA:"+wallet2.publicKey),
			})
		})
		await transferTx.wait()

		// wallet2 sell
		const orderId = await retry(10, 4000, async () => {
			const sell = await it.sdkSecond.order.sell.prepare({ itemId })
			return sell.submit({
				amount: 1,
				currency: { "@type": "SOLANA_SOL" },
				price: toBigNumber("0.002"),
			})
		})

		// wallet1 buy
		const tx = await retry(10, 4000, async () => {
			const buy = await it.sdk.order.buy.prepare({
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
