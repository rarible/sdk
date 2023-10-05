import type { UnionAddress } from "@rarible/types"
import { Blockchain, OrderStatus } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import { waitForDate } from "../../common/wait-for-date"
import { DEV_PK_1, DEV_PK_2 } from "./test/common"
import { EVMTestSuiteFactory } from "./test/suite"
import type { EVMTestSuite } from "./test/suite"

describe("bid", () => {
	const suiteFactory = new EVMTestSuiteFactory(Blockchain.ETHEREUM)

	let suiteDev1: EVMTestSuite<Blockchain.ETHEREUM>
	let suiteDev2: EVMTestSuite<Blockchain.ETHEREUM>

	beforeAll(async () => {
		suiteDev1 = await suiteFactory.create(DEV_PK_1)
		suiteDev2 = await suiteFactory.create(DEV_PK_2)
	})

	afterAll(() => {
		suiteDev1.destroy()
		suiteDev2.destroy()
	})

	test("bid on erc1155 <-> erc20 and update bid (full)", async () => {
		const erc1155 = suiteDev1.contracts.getContract("erc1155_1")
		const erc20Mintable = suiteDev2.contracts.getContract("erc20_mintable_1")
		const { itemId } = await suiteDev1.items.mintLazyAndWait(erc1155.collectionId, { supply: 10 })
		const price = toBn(0.00002)
		const quantity = toBn(5)
		const nextPrice = price.multipliedBy(2)

		const orderId = await suiteDev2.orders.bidWithPrepare({
			itemId,
			price,
			quantity,
			currency: erc20Mintable.asset,
			originFees: [createPart(suiteDev2.addressUnion, 1000)],
		})

		const updatedOrderId = await suiteDev2.orders.updateBidByPrepare(orderId, nextPrice)
		await suiteDev1.orders.acceptBid(itemId, updatedOrderId, quantity)
	})

	test.only("bid on erc1155 <-> erc20 and update bid (partial fill)", async () => {
		const erc1155 = suiteDev1.contracts.getContract("erc1155_1")
		const erc20Mintable = suiteDev2.contracts.getContract("erc20_mintable_1")
		const { itemId } = await suiteDev1.items.mintLazyAndWait(erc1155.collectionId, { supply: 10 })
		const price = toBn(0.00002)
		const quantity = toBn(5)
		const nextPrice = price.multipliedBy(2)

		const orderId = await suiteDev2.orders.bidWithPrepare({
			itemId,
			price,
			quantity,
			currency: erc20Mintable.asset,
			originFees: [createPart(suiteDev2.addressUnion, 1000)],
		})

		const acceptQuantity = toBn(2)
		const updatedOrderId = await suiteDev2.orders.updateBidByPrepare(orderId, nextPrice)

		await suiteDev1.orders.acceptBid(itemId, updatedOrderId, acceptQuantity)
	})

	test("bid on erc721 <-> erc20 and update bid", async () => {
		const erc721 = suiteDev1.contracts.getContract("erc721_1")
		const erc20Mintable = suiteDev1.contracts.getContract("erc20_mintable_1")
		const { itemId } = await suiteDev1.items.mintAndWait(erc721.collectionId)

		const price = toBn(0.00002)
		const orderId = await suiteDev2.orders.bidWithPrepare({
			itemId,
			price,
			currency: erc20Mintable.asset,
		})
		const nextPrice = price.multipliedBy(2)
		const updatedOrderId = await suiteDev2.orders.updateBidByPrepare(orderId, nextPrice)
		await suiteDev1.orders.acceptBid(itemId, updatedOrderId, 1)
	})

	test("bid on erc1155 lazy <-> erc20 and update bid (full)", async () => {
		const erc1155 = suiteDev1.contracts.getContract("erc1155_1")
		const erc20 = suiteDev1.contracts.getContract("erc20_mintable_1")
		const { itemId } = await suiteDev1.items.mintLazyAndWait(erc1155.collectionId, { supply: 10 })
		const price = toBn(0.00002)
		const quantity = toBn(5)

		const orderId = await suiteDev2.orders.bidWithPrepare({
			itemId,
			price,
			quantity,
			currency: erc20.asset,
			originFees: [createPart(suiteDev2.addressUnion, 1000)],
		})
		const nextPrice = price.multipliedBy(2)
		const updatedOrderId = await suiteDev2.orders.updateBidByPrepare(orderId, nextPrice)
		await suiteDev1.orders.acceptBid(itemId, updatedOrderId, quantity)
	})

	test("bid on erc1155 lazy <-> erc20 and update bid (partial fill)", async () => {
		const erc1155 = suiteDev1.contracts.getContract("erc1155_1")
		const erc20 = suiteDev1.contracts.getContract("erc20_mintable_1")
		const { itemId } = await suiteDev1.items.mintLazyAndWait(erc1155.collectionId, { supply: 10 })
		const price = toBn(0.00002)
		const quantity = toBn(5)

		const orderId = await suiteDev2.orders.bidWithPrepare({
			itemId,
			price,
			quantity,
			currency: erc20.asset,
			originFees: [createPart(suiteDev2.addressUnion, 1000)],
		})
		const nextPrice = price.multipliedBy(2)
		const updatedOrderId = await suiteDev2.orders.updateBidByPrepare(orderId, nextPrice)
		const acceptQuantity = quantity.minus(3)
		await suiteDev1.orders.acceptBid(itemId, updatedOrderId, acceptQuantity)
	})

	test("bid on erc721 <-> erc20 with wrapping", async () => {
		const suiteCustom = await suiteFactory.create()
		const erc721 = suiteDev1.contracts.getContract("erc721_1")
		const wrappedEth = suiteDev2.contracts.getContract("wrapped_eth")
		const { itemId } = await suiteDev1.items.mintAndWait(erc721.collectionId)

		const price = toBn(0.00002)
		const feeBp = toBn(1000)
		const originFees = [createPart(suiteDev1.addressUnion, feeBp)]
		const total = price.multipliedBy(toBn(1).plus(feeBp.dividedBy(10000)))
		await suiteDev1.sponsor(suiteCustom.addressEvm, total)

		const response = await suiteCustom.sdk.order.bid.prepare({ itemId })
		const commonForm = {
			price: price.toString(),
			originFees: originFees,
			amount: 1,
		}
		const convertable = await response.getConvertableValue({
			...commonForm,
			assetType: wrappedEth.asset,
		})
		if (!convertable) throw new Error("Should be convertable")
		expect(convertable.type).toEqual("convertable")
		expect(convertable.value).toEqual(total)

		await wrappedEth.deposit(total)
		const orderId = await response.submit({
			...commonForm,
			currency: wrappedEth.asset,
			expirationDate: new Date(Date.now() + 1000 * 60 * 60),
		})
		await suiteDev1.orders.acceptBid(itemId, orderId, 1)
		suiteCustom.destroy()
	})

	test("bid on erc1155 <-> erc20 with wrapping", async () => {
		const suiteCustom = await suiteFactory.create()
		const quantity = toBn(10)
		const erc1155 = suiteDev1.contracts.getContract("erc1155_1")
		const wrappedEth = suiteDev2.contracts.getContract("wrapped_eth")
		const { itemId } = await suiteDev1.items.mintAndWait(erc1155.collectionId, { supply: quantity.toNumber() })

		const price = toBn(0.00002)
		const feeBp = toBn(1000)
		const acceptQuantity = toBn(2)
		const originFees = [createPart(suiteDev1.addressUnion, feeBp)]
		const total = price.multipliedBy(acceptQuantity).multipliedBy(toBn(1).plus(feeBp.dividedBy(10000)))
		await suiteDev1.sponsor(suiteCustom.addressEvm, total)

		const response = await suiteCustom.sdk.order.bid.prepare({ itemId })
		const commonForm = {
			price: price.toString(),
			originFees: originFees,
			amount: acceptQuantity.toNumber(),
		}
		const convertable = await response.getConvertableValue({
			...commonForm,
			assetType: wrappedEth.asset,
		})
		if (!convertable) throw new Error("Should be convertable")
		expect(convertable.type).toEqual("convertable")
		expect(convertable.value).toEqual(total)

		await wrappedEth.deposit(total)
		const orderId = await response.submit({
			...commonForm,
			currency: wrappedEth.asset,
			expirationDate: new Date(Date.now() + 1000 * 60 * 60),
		})
		await suiteDev1.orders.acceptBid(itemId, orderId, acceptQuantity)
		suiteCustom.destroy()
	})

	test("getConvertableValue returns undefined when passed non-weth contract", async () => {
		const suiteCustom = await suiteFactory.create()
		const erc1155 = suiteDev1.contracts.getContract("erc1155_1")
		const erc20 = suiteDev1.contracts.getContract("erc20_mintable_1")
		const { itemId } = await suiteDev1.items.mintAndWait(erc1155.collectionId, { supply: 100 })

		const response = await suiteCustom.sdk.order.bid.prepare({ itemId })
		const convertable = await response.getConvertableValue({
			assetType: erc20.asset,
			price: toBn(0.00001).toString(),
			amount: 5,
			originFees: [],
		})
		expect(convertable).toEqual(undefined)
		suiteCustom.destroy()
	})

	test("getConvertableValue returns insufficient type", async () => {
		const suiteCustom = await suiteFactory.create()
		const wrappedEth = suiteDev1.contracts.getContract("wrapped_eth")
		const erc1155 = suiteDev1.contracts.getContract("erc1155_1")
		const { itemId } = await suiteDev1.items.mintAndWait(erc1155.collectionId)
		const response = await suiteCustom.sdk.order.bid.prepare({ itemId })
		const price = toBn(0.00001)
		const feeBp = toBn(1000)
		const amount = toBn(5)

		const value = await response.getConvertableValue({
			assetType: wrappedEth.asset,
			price: price.toString(),
			amount: amount.toNumber(),
			originFees: [createPart(suiteDev1.addressUnion, feeBp)],
		})

		if (!value) throw new Error("Convertable value must be non-undefined")
		const feeMultiplier = toBn(1).plus(feeBp.div(10000))
		const finalValue = price.multipliedBy(amount).multipliedBy(feeMultiplier)
		expect(value.value.toString()).toEqual(finalValue.toString())
		expect(value.type).toEqual("insufficient")
		suiteCustom.destroy()
	})

	test("collection bid", async () => {
		const erc721 = suiteDev1.contracts.getContract("erc721_1")
		const erc20 = suiteDev1.contracts.getContract("erc20_mintable_1")
		const { itemId } = await suiteDev1.items.mintAndWait(erc721.collectionId)

		const orderId = await suiteDev2.orders.bidByCollection({
			collectionId: erc721.collectionId,
			price: toBn(0.00001).toString(),
			currency: erc20.asset,
		})

		await suiteDev1.orders.acceptBid(itemId, orderId, 1)
	})

	test("collection bid (lazy)", async () => {
		const erc721 = suiteDev1.contracts.getContract("erc721_1")
		const erc20 = suiteDev1.contracts.getContract("erc20_mintable_1")
		const { itemId } = await suiteDev1.items.mintLazyAndWait(erc721.collectionId)

		const orderId = await suiteDev2.orders.bidByCollection({
			collectionId: erc721.collectionId,
			price: toBn(0.00001).toString(),
			currency: erc20.asset,
		})

		await suiteDev1.orders.acceptBid(itemId, orderId, 1)
	})

	test("collection bid (expired)", async () => {
		const erc721 = suiteDev1.contracts.getContract("erc721_1")
		const erc20 = suiteDev1.contracts.getContract("erc20_mintable_1")

		const expirationDate = new Date(Date.now() + 1000 * 10)
		const orderId = await suiteDev2.orders.bidByCollection({
			collectionId: erc721.collectionId,
			price: toBn(0.00001).toString(),
			currency: erc20.asset,
			expiration: expirationDate,
		})

		await suiteDev1.orders.waitStatus(orderId, OrderStatus.ACTIVE)
		await waitForDate(expirationDate)
		await suiteDev1.orders.waitStatus(orderId, OrderStatus.INACTIVE)
		await expect(() => suiteDev1.sdk.order.acceptBid.prepare({ orderId })).rejects.toBeTruthy()
	})
})

function createPart(address: UnionAddress, value: BigNumberValue) {
	return {
		account: address,
		value: toBn(value).toNumber(),
	}
}
