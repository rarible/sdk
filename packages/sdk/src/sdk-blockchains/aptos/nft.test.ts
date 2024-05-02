import { Blockchain } from "@rarible/api-client"
import { retry } from "@rarible/sdk-common"
import type { CommonTokenMetadataResponse } from "../../types/nft/mint/preprocess-meta"
import { createSdk } from "./common/tests/create-sdk"

describe("Aptos NFT", () => {
	const sdk = createSdk()

	test("test preprocess metadata", () => {
		const response = sdk.nft.preprocessMeta({
			blockchain: Blockchain.APTOS,
			name: "1",
			description: "2",
			image: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
			animation_url: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG6",
			external_url: "https://rarible.com",
			attributes: [{
				trait_type: "eyes",
				value: "1",
			}],
		}) as CommonTokenMetadataResponse

		expect(response.name).toBe("1")
		expect(response.description).toBe("2")
		expect(response.image).toBe("ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5")
		expect(response.animation_url).toBe("ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG6")
		expect(response.external_url).toBe("https://rarible.com")
		expect(response.attributes[0].key).toBe("eyes")
		expect(response.attributes[0].value).toBe("1")
	})

	test("create collection", async () => {
		const randomId = Math.floor(Math.random() * 100_000_000)

		const response = await sdk.nft.createCollection({
			blockchain: Blockchain.APTOS,
			//Collection name must be unique
			name: `Aptos collection #${randomId}-${randomId}`,
			description: "",
			uri: "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/",
		})
		await retry(20, 4000, () =>
			sdk.apis.collection.getCollectionById({ collection: response.address }),
		)
	})
})
