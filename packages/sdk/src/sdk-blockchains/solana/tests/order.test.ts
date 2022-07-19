import type { Item } from "@rarible/api-client/build/models"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"
import { createSdk } from "../common/test/create-sdk"

describe("Solana order", () => {
	const wallet = getWallet()
	const sdk = createSdk(wallet)

	const defaultBaseFee = 0 //250

	let tokenForSell: Item
	let tokenForBid: Item
	beforeAll(async () => {
		tokenForSell = await mintToken(sdk)
		tokenForBid = await mintToken(sdk)
	})

	test("create order with precision price", async () => {
		const mint = await mintToken(sdk)
		const sell = await sdk.order.sell({ itemId: mint.id })
		const price = "10000000000.000000001"

		const orderId = await sell.submit({
			amount: 1,
			price: price,
			currency: { "@type": "SOLANA_SOL" },
		})
		const order = await retry(10, 2000, () => sdk.apis.order.getOrderById({ id: orderId }))
		expect(order.take.value).toEqual(price)
	})

	test("baseFee for sell", async () => {
		const sell = await sdk.order.sell({ itemId: tokenForSell.id })
		expect(sell.baseFee).toEqual(defaultBaseFee)
	})

	test("baseFee for sellUpdate", async () => {
		const sell = await sdk.order.sell({ itemId: tokenForSell.id })
		const order = await sell.submit({
			amount: 1,
			price: 0.0001,
			currency: { "@type": "SOLANA_SOL" },
		})

		const update = await retry(10, 4000, async () => await sdk.order.sellUpdate({ orderId: order }))
		expect(update.baseFee).toEqual(defaultBaseFee)
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
