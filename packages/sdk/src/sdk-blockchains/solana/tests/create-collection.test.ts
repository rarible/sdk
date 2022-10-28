import { Blockchain } from "@rarible/api-client"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { createSdk } from "../common/test/create-sdk"

describe("Solana collection", () => {
	const wallet = getWallet()
	const it = awaitAll({
		sdk: createSdk(wallet),
	})

	test("Should create an collection", async () => {
		const res = await it.sdk.nft.createCollection({
			blockchain: Blockchain.SOLANA,
			metadataURI: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
		})

		await res.tx.wait()
		const collection = await retry(10, 4000, () =>
			it.sdk.apis.collection.getCollectionById({ collection: res.address }),
		)

		expect(collection).toBeTruthy()
	})

	test("Should create an collection with basic function", async () => {
		const response = await it.sdk.nft.createCollection({
			blockchain: Blockchain.SOLANA,
			metadataURI: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
		})

		await response.tx.wait()
		const collection = await retry(10, 4000, () =>
			it.sdk.apis.collection.getCollectionById({ collection: response.address }),
		)

		expect(collection).toBeTruthy()
	})
})
