import { Blockchain } from "@rarible/api-client"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { createSdk } from "../common/test/create-sdk"

describe("Solana collection", () => {
	const wallet = getWallet()
	const sdk = createSdk(wallet)

	test("Should create an collection", async () => {
		const res = await sdk.nft.createCollection({
			blockchain: Blockchain.SOLANA,
			asset: {
				arguments: {
					metadataURI: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
				},
			},
		})

		res.tx.wait()
		const collection = await retry(10, 4000, () =>
			sdk.apis.collection.getCollectionById({ collection: res.address }),
		)

		expect(collection).toBeTruthy()
	})
})
