import { SolanaWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"

describe("Solana collection", () => {
	const wallet = getWallet()
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "development", { logs: LogsLevel.DISABLED })

	test("Should create an collection", async () => {
		const res = await sdk.nft.createCollection({
			blockchain: Blockchain.SOLANA,
			asset: {
				arguments: {
					metadataURI: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
				},
			},
		})

		await res.tx.wait()
		const collection = await retry(10, 4000, () =>
			sdk.apis.collection.getCollectionById({ collection: res.address }),
		)

		expect(collection).toBeTruthy()
	})

	test("Should create an collection with basic function", async () => {
		const response = await sdk.nftBasic.createCollection({
			blockchain: Blockchain.SOLANA,
			metadataURI: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
		})

		await response.tx.wait()
		const collection = await retry(10, 4000, () =>
			sdk.apis.collection.getCollectionById({ collection: response.address }),
		)

		expect(collection).toBeTruthy()
	})
})
