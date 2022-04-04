import { FLOW_ZERO_ADDRESS, toContractAddress, toItemId, toUnionAddress } from "@rarible/types"
import { isFlowAddress } from "@rarible/flow-sdk/build/common/flow-address"
import * as converters from "."
import { toFlowParts } from "."

describe("Test FLOW converter functions", () => {
	test("getFlowCollection: should success get collection if address with prefix", () => {
		const test0 = converters.getFlowCollection(toContractAddress("FLOW:A.0xabcdef0123456789.ContractName"))
		expect(typeof test0).toEqual("string")
	})
	test("getFlowCollection: should success get collection if address without prefix", () => {
		const test1 = () => converters.getFlowCollection(toContractAddress("FLOW:A.abcdef0123456789.ContractName"))
		expect(typeof test1()).toEqual("string")
	})
	test("getFlowCollection: should success get collection with underscore", () => {
		const test1 = () => converters.getFlowCollection(toContractAddress("FLOW:A.abcdef0123456789.C_Name"))
		expect(typeof test1()).toEqual("string")
	})
	test("getFlowCollection should throw error, blockchain not defined", () => {
		const test2 = () => converters.getFlowCollection(toContractAddress("A.0xabcdef0123456789.ContractName"))
		expect(test2).toThrow(Error)
	})
	test("getFlowCollection should throw error, incorrect address length", () => {
		const test3 = () => converters.getFlowCollection(toContractAddress("Flow:A.0xabcdef0123.ContractName"))
		expect(test3).toThrow(Error)
	})
	test("getFlowCollection should throw error, Blockchain not defined but colon is exist", () => {
		const test4 = () => converters.getFlowCollection(toContractAddress(":A.0xabcdef0123456789.ContractName"))
		expect(test4).toThrow(Error)
	})
	test("getFlowCollection should throw error, Invalid contract name length", () => {
		const test5 = () => converters.getFlowCollection(toContractAddress("FLOW:A.0xabcdef0123456789.Co"))
		expect(test5).toThrow(Error)
	})
	test("getFlowCollection should throw error, Without contract name", () => {
		const test6 = () => converters.getFlowCollection(toContractAddress("FLOW:A.0xabcdef0123456789"))
		expect(test6).toThrow(Error)
	})
	test("getFlowCollection should throw error, Without collection 'A' prefix", () => {
		const test7 = () => converters.getFlowCollection(toContractAddress("FLOW:0xabcdef0123456789.ContractName"))
		expect(test7).toThrow(Error)
	})
	test("parseUnionItemId function, should parse if address with prefix", () => {
		const {
			blockchain,
			contract,
			itemId,
		} = converters.parseFlowItemIdFromUnionItemId(
			toItemId("FLOW:A.0xabcdef0123456789.ContractName:12345"),
		)
		expect(blockchain).toEqual("FLOW")
		expect(contract.length).toEqual(33)
		expect(itemId.length).toEqual(5)
	})
	test("parseUnionItemId function, should parse if address without prefix", () => {
		const {
			blockchain,
			contract,
			itemId,
		} = converters.parseFlowItemIdFromUnionItemId(
			toItemId("FLOW:A.abcdef0123456789.ContractName:123"),
		)
		expect(blockchain).toEqual("FLOW")
		expect(contract.length).toEqual(31)
		expect(itemId.length).toEqual(3)
	})
	test("parseUnionItemId function should throw error, blockchain not defined", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId("0xabcdef0123456789.ContractName:0"))
		expect(test1).toThrow(Error)
	})
	test("parseUnionItemId function should throw error, Blockchain not defined but colon is exist", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId(":0xabcdef0123456789.ContractName:0"))
		expect(test1).toThrow(Error)
	})
	test("parseUnionItemId function should throw error, incorrect address", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId("FLOW:bcdef0123456789.ContractName:0"))
		expect(test1).toThrow(Error)
	})
	test("parseUnionItemId function should throw error, incorrect contract name(with digit)", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId("FLOW:0xabcdef0123456789.ContractName1:0"))
		expect(test1).toThrow(Error)
	})
	test("parseUnionItemId function should throw error, incorrect contract name length", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId("FLOW:0xabcdef0123456789.Co:0"))
		expect(test1).toThrow(Error)
	})
	test("parseUnionItemId function should throw error, token id not defined", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId("FLOW:0xabcdef0123456789.Co:"))
		expect(test1).toThrow(Error)
	})
	test("parseUnionItemId function should throw error, colon and token id not defined", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId("FLOW:0xabcdef0123456789.Co"))
		expect(test1).toThrow(Error)
	})
	test("parseFlowMaker function, should parse address with prefix", () => {
		const test1 = converters.parseFlowAddressFromUnionAddress(toUnionAddress("FLOW:0xabcdef0123456789"))
		expect(test1?.length).toEqual(18)
	})
	test("parseFlowMaker function, should parse address without prefix", () => {
		const test1 = converters.parseFlowAddressFromUnionAddress(toUnionAddress("FLOW:abcdef0123456789"))
		expect(test1?.length).toEqual(18)
	})
	test("parseFlowMaker function should throw error, blockchain is not defined", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId("0xabcdef0123456789"))
		expect(test1).toThrow(Error)
	})
	test("parseFlowMaker function should throw error, blockchain is not defined but colon is exist", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId(":0xabcdef0123456789"))
		expect(test1).toThrow(Error)
	})
	test("parseFlowMaker function should throw error, incorrect address with prefix", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId("FLOW:0xzbcdef0123456789"))
		expect(test1).toThrow(Error)
	})
	test("parseFlowMaker function should throw error, incorrect address without prefix", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId("FLOW:abcdef012345678z"))
		expect(test1).toThrow(Error)
	})
	test("parseFlowMaker function should throw error, incorrect address length", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId("FLOW:abcdef012345678"))
		expect(test1).toThrow(Error)
	})

	test("parseOrderId function, should return flow item id", () => {
		const test1 = converters.parseOrderId("FLOW:1298749123846712")
		expect(test1.toString().length).toEqual(16)
	})
	test("parseOrderId function, should return flow item id", () => {
		const test1 = converters.parseOrderId("FLOW:0")
		expect(test1.toString().length).toEqual(1)
	})
	test("parseOrderId function, should throw error, blockchain part not exist", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId("13123412"))
		expect(test1).toThrow(Error)
	})
	test("parseOrderId function, should throw error, blockchain part not exist but colon is exist", () => {
		const test1 = () => converters.parseFlowItemIdFromUnionItemId(toItemId(":13123412"))
		expect(test1).toThrow(Error)
	})
	test("getFungibleTokenName function, should return FLOW", () => {
		const test1 = converters.getFungibleTokenName(toContractAddress("FLOW:A.0xabcdef0123456789.FlowToken"))
		expect(test1).toEqual("FLOW")
	})
	test("getFungibleTokenName function, should return FUSD", () => {
		const test1 = converters.getFungibleTokenName(toContractAddress("FLOW:A.0xabcdef0123456789.FUSD"))
		expect(test1).toEqual("FUSD")
	})
	test("getFungibleTokenName function, should throw error, incorrest contract name", () => {
		const test1 = () => converters.getFungibleTokenName(toContractAddress("FLOW:A.0xabcdef0123456789.CustomName"))
		expect(test1).toThrow(Error)
	})
	test("getFungibleTokenName function, should throw error, blockchain part is not exist", () => {
		const test1 = () => converters.getFungibleTokenName(toContractAddress("A.0xabcdef0123456789.CustomName"))
		expect(test1).toThrow(Error)
	})
	test("getFungibleTokenName function, should throw error, blockchain part is not exist, but colon is exist",
		() => {
			const test1 = () => converters.getFungibleTokenName(toContractAddress(":A.0xabcdef0123456789.CustomName"))
			expect(test1).toThrow(Error)
		})
	test("getFungibleTokenName function, should throw error, incorrect address",
		() => {
			const test1 = () => converters.getFungibleTokenName(toContractAddress(":A.0xzbcdef0123456789.CustomName"))
			expect(test1).toThrow(Error)
		})
	test("getFungibleTokenName function, should throw error, contract name is empty",
		() => {
			const test1 = () => converters.getFungibleTokenName(toContractAddress(":A.0xzbcdef0123456789."))
			expect(test1).toThrow(Error)
		})
	test("getFungibleTokenName function, should throw error, contract name is not exist",
		() => {
			const test1 = () => converters.getFungibleTokenName(toContractAddress(":A.0xzbcdef0123456789"))
			expect(test1).toThrow(Error)
		})
	test("getFungibleTokenName function, should throw error, incorrect contract name length",
		() => {
			const test1 = () => converters.getFungibleTokenName(toContractAddress(":A.0xzbcdef0123456789.C"))
			expect(test1).toThrow(Error)
		})
	test("getFungibleTokenName function, should throw error, incorrect contract name format",
		() => {
			const test1 = () => converters.getFungibleTokenName(toContractAddress(":A.0xzbcdef0123456789.C3"))
			expect(test1).toThrow(Error)
		})
	test("toFlowParts function, should convert union address to flow address", () => {
		const test1 = toFlowParts([{
			account: toUnionAddress(`FLOW:${FLOW_ZERO_ADDRESS}`),
			value: 500,
		}])
		expect(isFlowAddress(test1[0].account)).toBeTruthy()
	})
	test("toFlowParts function, should throw error, invalid union address", () => {
		const test1 = () => toFlowParts([{
			account: toUnionAddress("FLOW_ZERO_ADDRESS"),
			value: 500,
		}])
		expect(test1).toThrow(Error)
	})
})
