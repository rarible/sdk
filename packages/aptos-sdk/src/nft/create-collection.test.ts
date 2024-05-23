import { createTestAptosState } from "../common/test"
import { AptosNft } from "./nft"

describe("create collection", () => {
	const { aptos, config, wallet } = createTestAptosState()
	const deploy = new AptosNft(aptos, wallet, config)

	test("create collection", async () => {
		const uri = "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/"
		const randomId = Math.floor(Math.random() * 100_000_000)

		const { tx, collectionAddress } = await deploy.createCollection({
			name: `Test collection #${randomId}`,
			description: "description",
			uri,
		})
		console.log("Collection created", collectionAddress)
		console.log("tx", JSON.stringify(tx, null, "  "))
		expect(tx).toBeTruthy()
		expect(collectionAddress).toBeTruthy()
	})
})
