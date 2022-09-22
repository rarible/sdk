import { toAddress, toItemId, toOrderId, toUnionAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"

describe("ethereum api logger", () => {
	const sdk = createRaribleSdk(undefined, "testnet")

	const erc721Address = toAddress("0x64F088254d7EDE5dd6208639aaBf3614C80D396d")

	test("request url in error.value.url", async () => {
		let error: any = null
		try {
			await sdk.apis.collection.getCollectionById({ collection: erc721Address })
		} catch (e) {
			error = e
		}
		expect(error?.url).toBe("https://testnet-api.rarible.org/v0.1/collections/0x64f088254d7ede5dd6208639aabf3614c80d396d")
	})

	test("request url in EthereumSDK.apis.* returns error with error.url", async () => {
		let error: any = null
		try {
			const prepare = await sdk.nft.transfer.prepare({
				itemId: toItemId(`${Blockchain.ETHEREUM}:0x64F088254d7EDE5dd6208639aaBf3614C80D396d:0`),
			})
			await prepare.submit({
				to: toUnionAddress(`${Blockchain.ETHEREUM}:${ZERO_ADDRESS}`),
			})
		} catch (e) {
			error = e
			console.log(e)
		}
		expect(error?.url).toBe("https://testnet-ethereum-api.rarible.org/v0.1/nft/items/0x64F088254d7EDE5dd6208639aaBf3614C80D396d:0")
	})

	test("request url in FlowSDK.apis.* returns error with error.url", async () => {
		let error: any = null
		try {
			await sdk.order.bidUpdate.prepare({
				orderId: toOrderId("FLOW:106746924000000000000"),
			})
		} catch (e) {
			error = e
			console.log(e)
		}
		expect(error?.url).toBe("https://testnet-flow-api.rarible.org/v0.1/orders/106746924000000000000")
	})

})
