import { toAddress } from "@rarible/types"
import type { Erc20AssetType, EthAssetType } from "@rarible/ethereum-api-client"
import { createE2EProviderEmpty } from "../test/provider"
import { createTestWeb3Adapter } from "../test/provider-adapters"
import { getEthereumConfig } from "../../config"
import { getPrice } from "./index"

describe("getPrice", () => {
	const network = "polygon" as const
	const polygon = getEthereumConfig(network)
	const { provider } = createE2EProviderEmpty(network)
	const web3Ethereum = createTestWeb3Adapter(provider)

	// We're using here usdc polygon since it have 6 decimals
	const usdcPolygonAsset: Erc20AssetType = {
		assetClass: "ERC20",
		contract: toAddress("0x2791bca1f2de4661ed88a30c99a7a9449aa84174"),
	}

	test("get price for usdc (6-decimal erc20)", async () => {
		const value = await getPrice(web3Ethereum, usdcPolygonAsset, "0.000002")
		expect(value.toString()).toEqual("2")
	})

	const polygonWeth: Erc20AssetType = {
		assetClass: "ERC20",
		contract: polygon.weth,
	}
	const ethAsset: EthAssetType = {
		assetClass: "ETH",
	}
	test.each([polygonWeth, ethAsset])("get price for 18-decimal $assetClass", async (asset) => {
		const value = await getPrice(web3Ethereum, asset, "0.000000000000000002")
		expect(value.toString()).toEqual("2")
	})
})
