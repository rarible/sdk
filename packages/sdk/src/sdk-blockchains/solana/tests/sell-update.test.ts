import { SolanaWallet } from "@rarible/sdk-wallet"
import { toBigNumber, toCollectionId } from "@rarible/types"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { MintType } from "../../../types/nft/mint/domain"
import { retry } from "../../../common/retry"

describe("Solana sell order update", () => {
	const wallet = getWallet(0)
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "development", { logs: LogsLevel.DISABLED })

	test("Should set item to sell & change price", async () => {
		const mint = await sdk.nft.mint({
			collectionId: toCollectionId("SOLANA:Ev9n3xAfCrxPrUSUN4mLorwfaknjj4QMcyLUnbPymSmJ"),
		})

		const mintRes = await mint.submit({
			supply: 0,
			lazyMint: false,
			uri: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
		})

		expect(mintRes.itemId).toBeTruthy()
		if (mintRes.type === MintType.ON_CHAIN) {
			await mintRes.transaction.wait()
		}

		const itemId = mintRes.itemId

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
