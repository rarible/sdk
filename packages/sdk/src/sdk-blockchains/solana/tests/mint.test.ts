import { toCollectionId } from "@rarible/types"
import { SolanaWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { MintType } from "../../../types/nft/mint/domain"
import { retry } from "../../../common/retry"

describe("Solana mint", () => {
	const wallet = getWallet()
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "dev", { logs: LogsLevel.DISABLED })

	test("mint an nft", async () => {
		const { submit } = await sdk.nft.mint({
			collectionId: toCollectionId("SOLANA:65DNtgn5enhi6QXevn64jFq41Qgv71bvr8UVVwGiYkLJ"),
		})

		const res = await submit({
			supply: 1,
			lazyMint: false,
			uri: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
		})

		expect(res.itemId).toBeTruthy()
		expect(res.type).toEqual(MintType.ON_CHAIN)
		if (res.type === MintType.ON_CHAIN) {
			await res.transaction.wait()
			expect(res.transaction.hash).toBeTruthy()
		}

		const nft = await retry(10, 4000, () => sdk.apis.item.getItemById({ itemId: res.itemId }))
		expect(nft.id).toEqual(res.itemId)
	})
})
