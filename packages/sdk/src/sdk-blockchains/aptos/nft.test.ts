import { Blockchain } from "@rarible/api-client"
import { retry } from "@rarible/sdk-common"
import { createSdk } from "./common/tests/create-sdk"

describe("Aptos NFT", () => {
	const sdk = createSdk()

	test("create collection", async () => {
		const randomId = Math.floor(Math.random() * 100_000_000)

		const response = await sdk.nft.createCollection({
			blockchain: Blockchain.APTOS,
			//Collection name must be unique
			name: `Aptos collection #${randomId}-${randomId}`,
			description: "",
			uri: "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/",
		})
		await retry(10, 4000, () =>
			sdk.apis.collection.getCollectionById({ collection: response.address }),
		)
	})
})
