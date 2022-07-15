import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { createFlowSdk } from "@rarible/flow-sdk"
import { createApisSdk } from "../../common/apis"
import type { CommonTokenMetadataResponse } from "../../types/nft/mint/preprocess-meta"
import { retry } from "../../common/retry"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { FlowMint } from "./mint"
import { createTestItem } from "./test/create-test-item"

describe("Flow mint", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "testnet", {}, authUser1)
	const apis = createApisSdk("testnet")
	const mint = new FlowMint(sdk, apis, "testnet")

	test.skip("Should mint new NFT", async () => {
		const itemId = await createTestItem(mint)
		const nft = await retry(10, 4000, () => apis.item.getItemById({ itemId }))
		expect(nft.id).toEqual(itemId)
	})

	test("test preprocess metadata", () => {
		const response = mint.preprocessMeta({
			blockchain: Blockchain.FLOW,
			name: "1",
			description: "2",
			image: {
				url: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
				mimeType: "image/jpeg",
			},
			animation: {
				url: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG6",
				mimeType: "image/gif",
			},
			external: "https://rarible.com",
			attributes: [{
				key: "eyes",
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
})
