import {
	Account,
} from "@aptos-labs/ts-sdk"
import { createTestAptosState, mintTestToken } from "../common/test"
import { AptosNft } from "./nft"

describe("transfer nft", () => {
	const { aptos, account } = createTestAptosState()
	const transferClass = new AptosNft(aptos, account)

	test("transfer", async () => {
		const recepientAccount = Account.generate()
		const receipentAddress = recepientAccount.accountAddress.toStringLong()
		const testTokenAddress = await mintTestToken(aptos, account)

		await transferClass.transfer(
			testTokenAddress,
			receipentAddress
		)

		const assets = await aptos.getOwnedDigitalAssets({ ownerAddress: receipentAddress })
		const tokenOfNewOwner = assets.find(asset => asset.token_data_id === testTokenAddress)
		expect(tokenOfNewOwner).toBeTruthy()
	})

})
