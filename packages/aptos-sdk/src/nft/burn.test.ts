import { createTestAptosState, mintTestToken } from "../common/test"
import { AptosNft } from "./nft"

describe("burn nft", () => {
	const { aptos, account } = createTestAptosState()
	const burnClass = new AptosNft(aptos, account)

	test("burn", async () => {
		const testTokenAddress = await mintTestToken(aptos, account)

		await burnClass.burn(testTokenAddress)

		const assets = await aptos.getOwnedDigitalAssets({ ownerAddress: account.accountAddress })
		const tokenOfNewOwner = assets.find(asset => asset.token_data_id === testTokenAddress)
		expect(tokenOfNewOwner).toBeFalsy()
	})

})
