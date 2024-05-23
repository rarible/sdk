import { createTestAptosState, mintTestToken } from "../common/test"
import { AptosNft } from "./nft"

describe("burn nft", () => {
	const state = createTestAptosState()
	const { aptos, account, config, wallet } = state
	const burnClass = new AptosNft(aptos, wallet, config)

	test("burn", async () => {
		const testTokenAddress = await mintTestToken(state)

		await burnClass.burn(testTokenAddress)

		const assets = await aptos.getOwnedDigitalAssets({ ownerAddress: account.accountAddress })
		const tokenOfNewOwner = assets.find(asset => asset.token_data_id === testTokenAddress)
		expect(tokenOfNewOwner).toBeFalsy()
	})

})
