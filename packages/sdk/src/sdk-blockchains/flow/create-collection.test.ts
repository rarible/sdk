import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { createFlowSdk } from "@rarible/flow-sdk"
import { getContractAddress } from "@rarible/flow-sdk/build/config/utils"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { FlowCreateCollection } from "./create-collection"
import { createCollectionTest } from "./test/create-collection-test"

describe("Flow mint", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "dev", {}, authUser1)
	const collectionService = new FlowCreateCollection(sdk, "testnet")

	test("Should create collection", async () => {
		const tx = await createCollectionTest(collectionService)
		const [blockchain, contract, id] = tx.address.split(":")
		expect(blockchain).toEqual(Blockchain.FLOW)
		expect(contract).toEqual(getContractAddress("testnet", "SoftCollection"))
		expect(parseInt(id)).toBeGreaterThanOrEqual(0)
	})
})
