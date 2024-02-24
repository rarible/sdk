import { toAddress } from "@rarible/types"
import { getPrice } from "./get-price"
import { createE2eTestProvider } from "./test/create-test-providers"

describe("get price test", () => {
	const { web3Ethereum: ethereum } = createE2eTestProvider(
		"d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469",
	)

	test("get price", async () => {
		const value = await getPrice(ethereum, {
			assetClass: "ERC20",
			contract: toAddress("0x55eB2809896aB7414706AaCDde63e3BBb26e0BC6"),
		}, "0.000000000000000002")
		expect(value.toString()).toEqual("2")
	})
})
