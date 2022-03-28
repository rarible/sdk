import { toContractAddress, ZERO_ADDRESS } from "@rarible/types"
import type { EthErc20AssetType, EthEthereumAssetType, TezosFTAssetType, TezosXTZAssetType } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { FlowAssetTypeFt } from "@rarible/api-client/build/models/AssetType"
import { getCurrencyAssetType } from "./get-currency-asset-type"

describe("test getCurrencyAssetType", () => {
	test("get eth asset type from asset type", async () => {
		const assetType = getCurrencyAssetType({
			"@type": "ETH",
		})
		expect(assetType["@type"]).toEqual("ETH")
	})
	test("get erc-20 asset type from asset type", async () => {
		const assetType = getCurrencyAssetType({
			"@type": "ERC20",
			contract: toContractAddress("ETHEREUM:0x0000000000000000000000000000000000000001"),
		}) as EthErc20AssetType
		expect(assetType["@type"]).toEqual("ERC20")
		expect(assetType.contract).toEqual("ETHEREUM:0x0000000000000000000000000000000000000001")
	})
	test("get eth asset type from currency id", async () => {
		const assetType = getCurrencyAssetType(`ETHEREUM:${ZERO_ADDRESS}`) as EthEthereumAssetType
		expect(assetType["@type"]).toEqual("ETH")
		expect(assetType.blockchain).toEqual(Blockchain.ETHEREUM)
	})
	test("get polygon eth asset type from currency id", async () => {
		const assetType = getCurrencyAssetType(`POLYGON:${ZERO_ADDRESS}`) as EthEthereumAssetType
		expect(assetType["@type"]).toEqual("ETH")
		expect(assetType.blockchain).toEqual(Blockchain.POLYGON)
	})
	test("get erc-20 asset type from currency id", async () => {
		const assetType = getCurrencyAssetType("ETHEREUM:0x0000000000000000000000000000000000000001") as EthErc20AssetType
		expect(assetType["@type"]).toEqual("ERC20")
		expect(assetType.contract).toEqual("ETHEREUM:0x0000000000000000000000000000000000000001")
	})
	test("get flow_ft asset type from currency id", async () => {
		const assetType = getCurrencyAssetType("FLOW:A.7e60df042a9c0868.FlowToken") as FlowAssetTypeFt
		expect(assetType["@type"]).toEqual("FLOW_FT")
		expect(assetType.contract).toEqual("FLOW:A.7e60df042a9c0868.FlowToken")
	})
	test("get XTZ asset type from currency id", async () => {
		const assetType = getCurrencyAssetType("TEZOS:tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU") as TezosXTZAssetType
		expect(assetType["@type"]).toEqual("XTZ")
	})
	test("get tezos_ft asset type from currency id", async () => {
		const assetType = getCurrencyAssetType("TEZOS:KT1Rgf9RNW7gLj7JGn98yyVM34S4St9eudMC:0") as TezosFTAssetType
		expect(assetType["@type"]).toEqual("TEZOS_FT")
		expect(assetType.contract).toEqual("TEZOS:KT1Rgf9RNW7gLj7JGn98yyVM34S4St9eudMC")
		expect(assetType.tokenId).toEqual("0")
	})
})
