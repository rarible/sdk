import { SolanaWallet } from "@rarible/sdk-wallet"
import { toBigNumber, toCollectionId } from "@rarible/types"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { MintType } from "../../../types/nft/mint/domain"
import { retry } from "../../../common/retry"

describe("Solana cancel", () => {
	const wallet = getWallet(0)
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "development", { logs: LogsLevel.DISABLED })

	test("Should cancel NFT selling", async () => {
		const mint = await sdk.nft.mint({
			collectionId: toCollectionId("SOLANA:Ev9n3xAfCrxPrUSUN4mLorwfaknjj4QMcyLUnbPymSmJ"),
		})

		const mintRes = await mint.submit({
			supply: 0,
			lazyMint: false,
			uri: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
		})

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

		const cancelTx = await retry(10, 4000, () => sdk.order.cancel({
			orderId,
		}))

		expect(cancelTx.hash()).toBeTruthy()
		await cancelTx.wait()
	})
})
