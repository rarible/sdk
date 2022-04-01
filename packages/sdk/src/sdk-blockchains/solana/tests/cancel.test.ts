import { SolanaWallet } from "@rarible/sdk-wallet"
import { toBigNumber, toContractAddress, toItemId } from "@rarible/types"
import { toPublicKey } from "@rarible/solana-common"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { MintType } from "../../../types/nft/mint/domain"

describe("Solana cancel", () => {
	const wallet = getWallet(0)
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "dev", { logs: LogsLevel.DISABLED })

	test("Should cancel NFT selling", async () => {
		const mint = await sdk.nft.mint({
			collectionId: toContractAddress("SOLANA:65DNtgn5enhi6QXevn64jFq41Qgv71bvr8UVVwGiYkLJ"),
		})

		const mintRes = await mint.submit({
			supply: 1,
			lazyMint: false,
			uri: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
		})

		if (mintRes.type === MintType.ON_CHAIN) {
			await mintRes.transaction.wait()
		}

		const itemId = mintRes.itemId
		const sell = await sdk.order.sell({ itemId })
		const orderId = await sell.submit({
			amount: 1,
			currency: {
				"@type": "SOLANA_SOL",
			},
			price: toBigNumber("0.001"),
		})

		const cancelTx = await sdk.order.cancel({
			orderId,
		})

		expect(cancelTx.hash()).toBeTruthy()
		await cancelTx.wait()
	})
})
