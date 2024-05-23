import {
	Account,
} from "@aptos-labs/ts-sdk"
import { createTestAptosState, mintTestToken } from "../common/test"
import { AptosNft } from "./nft"

describe("transfer nft", () => {
	const state = createTestAptosState()
	const { aptos, wallet, config } = state
	const transferClass = new AptosNft(aptos, wallet, config)

	test("transfer", async () => {
		const recepientAccount = Account.generate()
		const receipentAddress = recepientAccount.accountAddress.toStringLong()
		const testTokenAddress = await mintTestToken(state)

		await transferClass.transfer(
			testTokenAddress,
			receipentAddress
		)

		const assets = await aptos.getOwnedDigitalAssets({ ownerAddress: receipentAddress })
		const tokenOfNewOwner = assets.find(asset => asset.token_data_id === testTokenAddress)
		expect(tokenOfNewOwner).toBeTruthy()
	})

})
