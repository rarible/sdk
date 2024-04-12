import { createTestAptosState, mintTestToken } from "../common/test"
import { AptosBurn } from "./burn"

describe("burn nft", () => {
	const { aptos, account } = createTestAptosState()
	const burnClass = new AptosBurn(aptos, account)

	test("burn", async () => {
		const testTokenAddress = await mintTestToken(aptos, account)

		await burnClass.burn(testTokenAddress)

		const assets = await aptos.getOwnedDigitalAssets({ ownerAddress: account.accountAddress })
		const tokenOfNewOwner = assets.find(asset => asset.token_data_id === testTokenAddress)
		expect(tokenOfNewOwner).toBeFalsy()
	})

})
