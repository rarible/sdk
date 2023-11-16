import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { getEthereumConfig } from "../config"
import { getEthUnionAddr } from "../common/test"
import { signOrder } from "./sign-order"
import { TEST_ORDER_TEMPLATE } from "./test/order"
import type { SimpleRaribleV2DataV1Order } from "./types"
import type { SimpleLegacyOrder } from "./types"

describe("signOrder", () => {
	const { provider } = createE2eProvider("d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469")
	const web3 = new Web3(provider)
	const ethereum = new Web3Ethereum({ web3 })
	const config = getEthereumConfig("dev-ethereum")
	const signOrderE2e = signOrder.bind(null, ethereum, config)

	test("should sign legacy orders", async () => {
		const signer = await ethereum.getFrom()
		const order: SimpleLegacyOrder = {
			...TEST_ORDER_TEMPLATE,
			data: {
				"@type": "ETH_RARIBLE_V1",
				fee: 100,
			},
			maker: getEthUnionAddr(signer),
		}

		const signature = await signOrderE2e(order)

		expect(signature).toEqual(
			"0x5fec2e13b0ad828fd4bd8908ca695518ecf8256218cf6d0c1fb3ecb460c8510222a2d52b9946c761217fcadfa88f7e120707c4fa1c441fb6c34f5bf5df821b741b"
		)
	})

	test("should sign v2 orders", async () => {
		const signer = await ethereum.getFrom()
		const signature = await signOrderE2e({
			...TEST_ORDER_TEMPLATE,
			data: {
				"@type": "ETH_RARIBLE_V2",
				payouts: [],
				originFees: [],
			},
			maker: getEthUnionAddr(signer),
		} as SimpleRaribleV2DataV1Order)
		expect(signature).toEqual(
			"0xf2f467bd5cd30de2cd6a2b83b8d3b8405a730a0453589ce252b2f25a38b19052236e0a18d0f44023617f4055822b5f4fbf54dd091e87cf71c4f8f9a133136cf51c"
		)
	})
})
