import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { createFlowSdk } from "@rarible/flow-sdk"
import { createApisSdk } from "../../common/apis"
import { retry } from "../../common/retry"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { FlowCreateCollection } from "./create-collection"
import { createCollectionTest } from "./test/create-collection-test"
import { FlowMint } from "./mint"
import { createTestItem } from "./test/create-test-item"
import { convertFlowContractAddress } from "./common/converters"
import { testFlowSoftCollection } from "./test/common"

describe("Flow mint", () => {
	const { authUser1 } = createTestFlowAuth(fcl)
	const wallet = new FlowWallet(fcl)
	const sdk = createFlowSdk(wallet.fcl, "dev", {}, authUser1)
	const collectionService = new FlowCreateCollection(sdk, "testnet")
	const apis = createApisSdk("dev")
	const mint = new FlowMint(sdk, apis, "testnet")

	test("Should create collection", async () => {
		const tx = await createCollectionTest(collectionService)
		const [blockchain, collectionId] = tx.address.split(":")
		const [, address, contractName, id] = collectionId.split(".")
		expect(blockchain).toEqual(Blockchain.FLOW)
		expect(`${blockchain}:A.${address}.${contractName}`)
			.toEqual(testFlowSoftCollection)
		expect(parseInt(id)).toBeGreaterThanOrEqual(0)

		await retry(10, 1000, async () => apis.collection.getCollectionById({ collection: tx.address }))

		const itemId = await createTestItem(mint, convertFlowContractAddress(collectionId))

		const nft = await retry(10, 10000, async () => apis.item.getItemById({ itemId }))
		expect(nft.id).toEqual(itemId)
	})
})
