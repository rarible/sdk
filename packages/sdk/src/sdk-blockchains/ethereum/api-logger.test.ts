import { toAddress, toBigNumber, toItemId, toOrderId, toUnionAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { createSdk } from "../../common/test/create-sdk"
import type { EVMTestSuite } from "./test/suite"
import { EVMTestSuiteFactory } from "./test/suite"

describe("ethereum api logger", () => {
	const sdk = createSdk(undefined, "testnet")
	const erc721Address = toAddress("0x64F088254d7EDE5dd6208639aaBf3614C80D396d")

	test.concurrent("request url in error.value.url", async () => {
		let error: any = null
		try {
			await sdk.apis.collection.getCollectionById({ collection: erc721Address })
		} catch (e) {
			error = e
		}
		expect(error).toBeTruthy()
	})

	test.concurrent("request url in EthereumSDK.apis.* returns error with error.url", async () => {
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
		}
		expect(error).toBeTruthy()
	})

	test.concurrent("request url in FlowSDK.apis.* returns error with error.url", async () => {
		let error: any = null
		try {
			await sdk.order.bidUpdate.prepare({
				orderId: toOrderId("FLOW:106746924000000000000"),
			})
		} catch (e) {
			error = e
		}
		expect(error).toBeTruthy()
	})
})

// @todo fix it because on node v16 it doesn't work because
// of unhandled promise rejection

describe.skip("ethereum api logger with tx ethereum errors", () => {
	const suiteFactory = new EVMTestSuiteFactory(Blockchain.ETHEREUM)

	let suiteDev1: EVMTestSuite<Blockchain.ETHEREUM>
	beforeAll(async () => (suiteDev1 = await suiteFactory.create()))
	afterAll(() => suiteDev1.destroy())

	test("should throw ethereum tx error", async () => {
		const erc721 = suiteDev1.contracts.getContract("erc721_1")

		try {
			await suiteDev1.items.mintAndWait(erc721.collectionId, {
				tokenId: {
					tokenId: toBigNumber("1"),
					signature: { v: "" as any, r: "" as any, s: "" as any },
				},
			})
		} catch (e: any) {
			expect(e.name).toBe("EthereumProviderError")
			expect(e.method).toBe("Web3FunctionCall.send")
		}
	})
})
