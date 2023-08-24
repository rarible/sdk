import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import { OrderStatus, Blockchain, BlockchainGroup } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import { MaxFeesBasePointSupport } from "../../types/order/fill/domain"
import { DEV_PK_1, DEV_PK_2 } from "./test/common"
import type { EVMTestSuite } from "./test/suite"
import { EVMTestSuiteFactory } from "./test/suite"

describe.skip("Create & fill orders with order data v3", () => {
	const suiteFactory = new EVMTestSuiteFactory(Blockchain.ETHEREUM)

	let suiteDev1: EVMTestSuite<Blockchain.ETHEREUM>
	let suiteDev2: EVMTestSuite<Blockchain.ETHEREUM>
	let suiteDev2Markerless: EVMTestSuite<Blockchain.ETHEREUM>

	beforeAll(async () => {
		suiteDev1 = await suiteFactory.create(DEV_PK_1, {
			blockchain: {
				[BlockchainGroup.ETHEREUM]: {
					marketplaceMarker: "0x00000000000000000000000000000000000000000000face",
					useDataV3: true,
				},
			},
		})
		suiteDev2 = await suiteFactory.create(DEV_PK_2, {
			blockchain: {
				[BlockchainGroup.ETHEREUM]: {
					marketplaceMarker: "0x00000000000000000000000000000000000000000000dead",
					useDataV3: true,
				},
			},
		})
		suiteDev2Markerless = await suiteFactory.create(DEV_PK_2, {
			blockchain: {
				[BlockchainGroup.ETHEREUM]: {
					useDataV3: true,
				},
			},
		})
	})

	afterAll(() => {
		suiteDev1.destroy()
		suiteDev2.destroy()
		suiteDev2Markerless.destroy()
	})

	test("erc721 sell and buy", async () => {
		const args = [
			[suiteDev1, suiteDev2Markerless, "000009616c6c64617461"],
			[suiteDev1, suiteDev2, "face09616c6c64617461"],
		] as const

		await args.reduce(async (prev, [seller, buyer, buyMarker]) => {
			await prev
			const erc721 = seller.contracts.getContract("erc721_1")
			const eth = seller.contracts.getContract("eth")
			const { itemId } = await seller.items.mintAndWait(erc721.collectionId)
			const sellAction = await seller.sdk.order.sell.prepare({ itemId: itemId })
			expect(sellAction.maxFeesBasePointSupport).toEqual(MaxFeesBasePointSupport.REQUIRED)

			const price = toBn(0.00001)
			const orderId = await sellAction.submit({
				amount: toBn(1).toNumber(),
				price: price.toString(),
				currency: eth.asset,
				originFees: [createPart(seller.addressUnion, 10)],
				maxFeesBasePoint: 500,
			})

			const nextPrice = price.dividedBy(2)
			await seller.orders.sellUpdate(orderId, nextPrice)

			const fillAction = await buyer.sdk.order.buy.prepare({ orderId })
			expect(fillAction.maxFeesBasePointSupport).toEqual(MaxFeesBasePointSupport.IGNORED)

			const tx = await fillAction.submit({ amount: 1 })
			expect(tx.transaction.data.endsWith(buyMarker)).toEqual(true)
			await tx.wait()

			seller.orders.waitOrderSubset(orderId, {
				status: OrderStatus.FILLED,
				makeStock: toBigNumber("0"),
			})
		}, Promise.resolve())
	})

	test.only("erc721 bid and accept", async () => {
		const args = [
			[suiteDev1, suiteDev2Markerless, "face09616c6c64617461"],
			[suiteDev1, suiteDev2, "face09616c6c64617461"],
		] as const

		await args.reduce(async (prev, [seller, buyer, buyMarker]) => {
			await prev
			const erc721 = seller.contracts.getContract("erc721_1")
			const wrappedEth = seller.contracts.getContract("wrapped_eth")
			const { itemId } = await seller.items.mintAndWait(erc721.collectionId)
			const bidAction = await buyer.sdk.order.bid.prepare({ itemId: itemId })
			expect(bidAction.maxFeesBasePointSupport).toEqual(MaxFeesBasePointSupport.IGNORED)

			const price = toBn("0.0000001")
			const orderId = await bidAction.submit({
				amount: toBn(1).toNumber(),
				price: price.toString(),
				currency: wrappedEth.asset,
				originFees: [createPart(seller.addressUnion, 10)],
				expirationDate: new Date(Date.now() + 1000 * 60 * 60),
			})

			const nextPrice = price.multipliedBy(2)
			await buyer.orders.updateBid(orderId, nextPrice)

			const fillAction = await seller.sdk.order.acceptBid.prepare({ orderId })
			expect(fillAction.maxFeesBasePointSupport).toEqual(MaxFeesBasePointSupport.REQUIRED)

			const tx = await fillAction.submit({
				amount: 1,
				maxFeesBasePoint: 500,
			})
			expect(tx.transaction.data.endsWith(buyMarker)).toEqual(true)
			await tx.wait()

			await seller.orders.waitOrderSubset(orderId, {
				status: OrderStatus.FILLED,
				makeStock: toBigNumber("0"),
			})
		}, Promise.resolve())
	})
})

function createPart(address: UnionAddress, value: BigNumberValue) {
	return {
		account: address,
		value: toBn(value).toNumber(),
	}
}
