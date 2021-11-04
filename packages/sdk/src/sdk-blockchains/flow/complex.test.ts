import * as fcl from "@onflow/fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { toBigNumber, toOrderId, toUnionAddress } from "@rarible/types"
import { FLOW_TEST_ACCOUNT_1 } from "@rarible/flow-test-common"
import { createTestOrder } from "./test/create-test-order"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { parseOrderId } from "./common/converters"
import { createFlowSdk } from "./index"

describe("test flow mint, order creation, and buy", () => {
	const { authUser1, authUser2 } = createTestFlowAuth(fcl)
	const wallet1 = new FlowWallet(fcl, toUnionAddress("FLOW:"), "testnet")
	const wallet2 = new FlowWallet(fcl, toUnionAddress("FLOW:"), "testnet")
	const sdk1 = createFlowSdk(wallet1, null as any, authUser1) //todo do not use createFlowSdk
	const sdk2 = createFlowSdk(wallet2, null as any, authUser2)
	const flowToken = toUnionAddress("FLOW:A.7e60df042a9c0868.FlowToken")
	const meta = "ipfs://ipfs/QmNe7Hd9xiqm1MXPtQQjVtksvWX6ieq9Wr6kgtqFo9D4CU"
	const collection = {
		id: toUnionAddress("FLOW:A.0xebf4ae01d1284af8.RaribleNFT"),
		type: "FLOW" as const,
		name: "RaribleNFT",
		symbol: "RARIBLE",
		owner: toUnionAddress("FLOW:0x01658d9b94068f3c"),
		features: [],
	}

	test.skip("Should create flow NFT order, create order, buy by created order", async () => {

		//Mint
		const prepareMint = await sdk2.nft.mint({ collection })
		const { itemId } = await prepareMint.submit({ uri: meta, supply: 1, lazyMint: false })
		const flowItemId = itemId.split(":")[2]
		expect(parseInt(flowItemId)).toBeGreaterThan(0)

		//Transfer
		const transfer = await sdk2.nft.transfer({ itemId })
		const transferResult = await transfer.submit({ to: toUnionAddress(`FLOW:${FLOW_TEST_ACCOUNT_1.address}`) })
		expect(transferResult.transaction.status).toEqual(4)

		//Create order
		const { submit } = await sdk1.order.sell({ collectionId: collection.id })
		const sellResult = await submit({
			amount: 1,
			price: toBigNumber("0.1"),
			currency: { "@type": "FLOW_FT", contract: flowToken },
			itemId,
		})
		expect(sellResult).toBeTruthy()

		//Update order
		const updateAction = await sdk1.order.sellUpdate({
			orderId: toOrderId("FLOW:14767115"),
		})
		const sellUpdateResult = await updateAction.submit({
			price: toBigNumber("0.2"),
		})
		expect(sellUpdateResult).toBeTruthy()

		//Buy by order
		const createOrder = createTestOrder(parseOrderId(sellResult))
		const prepareBuy = await sdk2.order.fill({ order: createOrder })
		const buyResult = await prepareBuy.submit({ amount: 1 })
		expect(buyResult.transaction.status).toEqual(4)

		//Burn item
		const burn = await sdk2.nft.burn({ itemId })
		const burnResult = await burn.submit()
		expect(burnResult.transaction.status).toEqual(4)
	}, 1500000)
})
