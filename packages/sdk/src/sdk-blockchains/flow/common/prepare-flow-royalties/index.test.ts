import { convertFlowUnionAddress } from "../converters"
import { prepareFlowRoyalties } from "."

describe("Test convert Royalty to FlowRoyalty", () => {
	test("Should convert basis points to string which contents number between 0 and 1", () => {
		const result = prepareFlowRoyalties(
			[{ account: convertFlowUnionAddress("0xabcdef0123456789"), value: 5789 }],
		)
		expect(result[0].value).toEqual("0.5789")

		const result1 = prepareFlowRoyalties(
			[{ account: convertFlowUnionAddress("0xabcdef0123456789"), value: 10000 }],
		)
		expect(result1[0].value).toEqual("1")

		const result2 = prepareFlowRoyalties(
			[{ account: convertFlowUnionAddress("0xabcdef0123456789"), value: 0 }],
		)
		expect(result2[0].value).toEqual("0")

		const result3 = () => prepareFlowRoyalties(
			[{ account: convertFlowUnionAddress("0xabcdef0123456789"), value: 999999 }],
		)
		expect(result3).toThrow(Error)

		const dummy = undefined
		const result4 = prepareFlowRoyalties(dummy)
		expect(result4.length).toEqual(0)
	})
})
