import { SolanaWallet } from "@rarible/sdk-wallet"
import type { Item } from "@rarible/api-client/build/models"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"

describe("Solana order", () => {
	const wallet = getWallet()
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "development", { logs: LogsLevel.DISABLED })

	const baseFee = 250

	let tokenForSell: Item
	let tokenForBid: Item
	beforeAll(async () => {
		tokenForSell = await mintToken(sdk)
		tokenForBid = await mintToken(sdk)
	})

	test("baseFee for sell", async () => {
		const sell = await sdk.order.sell({ itemId: tokenForSell.id })
		expect(sell.baseFee).toEqual(baseFee)
	})

	test("baseFee for sellUpdate", async () => {
		const sell = await sdk.order.sell({ itemId: tokenForSell.id })
		const order = await sell.submit({
			amount: 1,
			price: 0.0001,
			currency: {
				"@type": "SOLANA_SOL",
			},
		})

		const update = await retry(10, 4000, async () => await sdk.order.sellUpdate({ orderId: order }))
		expect(update.baseFee).toEqual(baseFee)
	})

	test("baseFee for bid", async () => {
		const sell = await sdk.order.bid({ itemId: tokenForBid.id })
		expect(sell.baseFee).toEqual(0)
	})


	test("baseFee for bidUpdate", async () => {
		const bid = await sdk.order.bid({ itemId: tokenForBid.id })
		const order = await bid.submit({
			amount: 1,
			price: 0.0001,
			currency: {
				"@type": "SOLANA_SOL",
			},
		})

		const update = await retry(10, 4000, async () => await sdk.order.bidUpdate({ orderId: order }))
		expect(update.baseFee).toEqual(0)
	})
})
