import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { toBigNumber, toUnionAddress } from "@rarible/types"
import { FLOW_TEST_ACCOUNT_1 } from "@rarible/flow-test-common"
import { CollectionControllerApi, Configuration, OrderControllerApi } from "@rarible/api-client"
import { IApisSdk } from "../../domain"
import { retryBackoff } from "../../common/retry-backoff"
import { getSdkConfig } from "../../config"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { createFlowSdk } from "./index"

describe("test flow mint, order creation, and buy", () => {
	const { authUser1, authUser2 } = createTestFlowAuth(fcl)
	const wallet1 = new FlowWallet(fcl)
	const wallet2 = new FlowWallet(fcl)
	const config = getSdkConfig("staging")
	const configuration = new Configuration(config)

	const apis = {
		collection: new CollectionControllerApi(configuration),
		order: new OrderControllerApi(configuration),
	} as IApisSdk

	// @todo do not use createFlowSdk
	const sdk1 = createFlowSdk(wallet1, apis, "testnet", authUser1)
	const sdk2 = createFlowSdk(wallet2, apis, "testnet", authUser2)
	const flowToken = toUnionAddress("FLOW:A.7e60df042a9c0868.FlowToken")
	const meta = "ipfs://ipfs/QmNe7Hd9xiqm1MXPtQQjVtksvWX6ieq9Wr6kgtqFo9D4CU"
	const collectionId = toUnionAddress("FLOW:A.ebf4ae01d1284af8.RaribleNFT")

	test("Should create flow NFT order, create order, buy by created order", async () => {
		//Mint
		const prepareMint = await sdk2.nft.mint({ collectionId })
		const { itemId } = await prepareMint.submit({
			uri: meta,
			supply: 1,
			lazyMint: false,
		})
		const flowItemId = itemId.split(":")[2]
		expect(parseInt(flowItemId)).toBeGreaterThan(0)

		//Transfer
		const transfer = await sdk2.nft.transfer({ itemId })
		const transferResult = await transfer.submit({
			to: toUnionAddress(`FLOW:${FLOW_TEST_ACCOUNT_1.address}`),
		})
		expect(transferResult.transaction.status).toEqual(4)

		//Create order
		const { submit } = await sdk1.order.sell({ collectionId })
		const orderId = await submit({
			amount: 1,
			price: toBigNumber("0.1"),
			currency: { "@type": "FLOW_FT", contract: flowToken },
			itemId,
		})
		const order = await retryBackoff(5, 1000, () => {
			return apis.order.getOrderById({ id: orderId })
		})
		expect(order).toBeTruthy()

		//Update order
		const updateAction = await sdk1.order.sellUpdate({ orderId })
		const sellUpdateResult = await updateAction.submit({
			price: toBigNumber("0.2"),
		})
		expect(sellUpdateResult).toBeTruthy()

		// @todo implement buy
		// // Buy by order
		// const createOrder = createTestOrder(parseOrderId(orderId))
		// const prepareBuy = await sdk2.order.fill({ order: createOrder })
		// const buyResult = await prepareBuy.submit({ amount: 1 })
		// expect(buyResult.transaction.status).toEqual(4)

		// @todo implement burn
		// //Burn item
		// const burn = await sdk2.nft.burn({ itemId })
		// const burnResult = await burn.submit()
		// expect(burnResult.transaction.status).toEqual(4)
		// console.log("burn", burnResult)
	}, 1000 * 60 * 5)
})
