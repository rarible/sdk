import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress } from "@rarible/types"
import { getPrice } from "./get-price"

describe("get price test", () => {
	const { provider } = createE2eProvider(
		"d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469",
	)
	const web3 = new Web3(provider)
	const ethereum = new Web3Ethereum({ web3 })

	test("get price", async () => {
		const value = await getPrice(ethereum, {
			assetClass: "ERC20",
			contract: toAddress("0x55eB2809896aB7414706AaCDde63e3BBb26e0BC6"),
		}, "0.000000000000000002")
		expect(value.toString()).toEqual("2")
	})
})
