import { Blockchain } from "@rarible/api-client"
import { toUnionAddress } from "@rarible/types"
import { getWallet } from "../common/test/test-wallets"
import type { ISolanaMetadataResponse } from "../domain"
import { createSdk } from "../common/test/create-sdk"

describe("Solana metadata", () => {
	const wallet = getWallet()
	const sdk = createSdk(wallet)

	test("Should create correct metadata", async () => {
		const meta = sdk.nft.preprocessMeta({
			blockchain: Blockchain.SOLANA,
			name: "name",
			symbol: "TEST",
			description: "description",
			royalties: { account: toUnionAddress("SOLANA:abc"), value: 15 },
			external: "http://external.url",
			image: { url: "http://image.png", mimeType: "image/png" },
			animation: { url: "http://image.gif", mimeType: "image/gif" },
			attributes: [{
				key: "a1",
				value: "1",
			}, {
				key: "a2",
				value: "2",
			}],
		}) as ISolanaMetadataResponse

		expect(meta.name).toEqual("name")
		expect(meta.symbol).toEqual("TEST")
		expect(meta.description).toEqual("description")
		expect(meta.seller_fee_basis_points).toEqual(1500)
		expect(meta.image).toEqual("http://image.png")
		expect(meta.animation_url).toEqual("http://image.gif")
		expect(meta.external_url).toEqual("http://external.url")
		expect(meta.properties?.creators).toEqual([{ address: wallet.publicKey.toString(), share: 100 }])
		expect(meta.properties?.files).toEqual([
			{
				uri: "http://image.png",
				type: "image/png",
			},
			{
				uri: "http://image.gif",
				type: "image/gif",
			},
		])
		expect(meta.attributes).toEqual([
			{
				"trait_type": "a1",
				value: "1",
			},
			{
				"trait_type": "a2",
				value: "2",
			},
		])
	})
})
