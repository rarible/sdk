import { toUnionContractAddress, toCurrencyId, ZERO_ADDRESS } from "@rarible/types"
import type { EthErc20AssetType, EthEthereumAssetType } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type {
  FlowAssetTypeFt,
  NativeCurrencyAssetType,
  TokenCurrencyAssetType,
} from "@rarible/api-client/build/models/AssetType"
import {
  convertCurrencyIdToAssetType,
  getCurrencyAssetType,
  getCurrencyId,
  getDataFromCurrencyId,
} from "./get-currency-asset-type"

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
      contract: toUnionContractAddress("ETHEREUM:0x0000000000000000000000000000000000000001"),
    }) as EthErc20AssetType
    expect(assetType["@type"]).toEqual("ERC20")
    expect(assetType.contract).toEqual("ETHEREUM:0x0000000000000000000000000000000000000001")
  })
  test("get eth asset type from currency id", async () => {
    const assetType = getCurrencyAssetType(toCurrencyId(`ETHEREUM:${ZERO_ADDRESS}`)) as EthEthereumAssetType
    expect(assetType["@type"]).toEqual("ETH")
    expect(assetType.blockchain).toEqual(Blockchain.ETHEREUM)
  })
  test("get polygon eth asset type from currency id", async () => {
    const assetType = getCurrencyAssetType(toCurrencyId(`POLYGON:${ZERO_ADDRESS}`)) as EthEthereumAssetType
    expect(assetType["@type"]).toEqual("ETH")
    expect(assetType.blockchain).toEqual(Blockchain.POLYGON)
  })
  test("get erc-20 asset type from currency id", async () => {
    const assetType = getCurrencyAssetType(
      toCurrencyId("ETHEREUM:0x0000000000000000000000000000000000000001"),
    ) as EthErc20AssetType
    expect(assetType["@type"]).toEqual("ERC20")
    expect(assetType.contract).toEqual("ETHEREUM:0x0000000000000000000000000000000000000001")
  })
  test("get flow_ft asset type from currency id", async () => {
    const assetType = getCurrencyAssetType(toCurrencyId("FLOW:A.7e60df042a9c0868.FlowToken")) as FlowAssetTypeFt
    expect(assetType["@type"]).toEqual("FLOW_FT")
    expect(assetType.contract).toEqual("FLOW:A.7e60df042a9c0868.FlowToken")
  })
  test("test getDataFromCurrencyId with ETH", async () => {
    const { blockchain, contract, tokenId } = getDataFromCurrencyId(
      toCurrencyId("ETHEREUM:0x0000000000000000000000000000000000000000"),
    )
    expect(blockchain).toEqual(Blockchain.ETHEREUM)
    expect(contract).toEqual("0x0000000000000000000000000000000000000000")
    expect(tokenId).toEqual(undefined)
  })
  test("test getDataFromCurrencyId with Ethereum ERC-20 contract", async () => {
    const { blockchain, contract, tokenId } = getDataFromCurrencyId(
      toCurrencyId("ETHEREUM:0x0000000000000000000000000000000000000001"),
    )
    expect(blockchain).toEqual(Blockchain.ETHEREUM)
    expect(contract).toEqual("0x0000000000000000000000000000000000000001")
    expect(tokenId).toEqual(undefined)
  })

  test("test convertCurrencyIdToAssetType", async () => {
    expect(convertCurrencyIdToAssetType(toCurrencyId("ETHEREUM:0x0000000000000000000000000000000000000000"))).toEqual({
      "@type": "ETH",
      blockchain: Blockchain.ETHEREUM,
    })
    expect(convertCurrencyIdToAssetType(toCurrencyId("POLYGON:0x0000000000000000000000000000000000000000"))).toEqual({
      "@type": "ETH",
      blockchain: Blockchain.POLYGON,
    })
    expect(convertCurrencyIdToAssetType(toCurrencyId("IMMUTABLEX:0x0000000000000000000000000000000000000000"))).toEqual(
      {
        "@type": "ETH",
        blockchain: Blockchain.IMMUTABLEX,
      },
    )
    expect(convertCurrencyIdToAssetType(toCurrencyId("ETHEREUM:0x1000000000000000000000000000000000000000"))).toEqual({
      "@type": "ERC20",
      contract: "ETHEREUM:0x1000000000000000000000000000000000000000",
    })
    expect(convertCurrencyIdToAssetType(toCurrencyId("POLYGON:0x2000000000000000000000000000000000000000"))).toEqual({
      "@type": "ERC20",
      contract: "POLYGON:0x2000000000000000000000000000000000000000",
    })
    expect(convertCurrencyIdToAssetType(toCurrencyId("IMMUTABLEX:0x3000000000000000000000000000000000000000"))).toEqual(
      {
        "@type": "ERC20",
        contract: "IMMUTABLEX:0x3000000000000000000000000000000000000000",
      },
    )
    expect(convertCurrencyIdToAssetType(toCurrencyId("SOLANA:0x0000000000000000000000000000000000000000"))).toEqual({
      "@type": "SOLANA_SOL",
    })
  })

  test("get eth asset type from aptos currency id", async () => {
    const assetType = getCurrencyAssetType(toCurrencyId("APTOS:0x1::aptos_coin::AptosCoin")) as NativeCurrencyAssetType
    expect(assetType["@type"]).toEqual("CURRENCY_NATIVE")
    expect(assetType.blockchain).toEqual("APTOS")
  })

  test("get eth asset type from base64 encoded aptos currency id", async () => {
    const assetType = getCurrencyAssetType(
      toCurrencyId("APTOS:MHgxOjphcHRvc19jb2luOjpBcHRvc0NvaW4="),
    ) as NativeCurrencyAssetType
    expect(assetType["@type"]).toEqual("CURRENCY_NATIVE")
    expect(assetType.blockchain).toEqual("APTOS")
  })

  test("get eth asset type from base64-like string", async () => {
    const assetType = getCurrencyAssetType(
      toCurrencyId("APTOS:0x000000000000000000000000000000000000000000000000000000000001234"),
    ) as TokenCurrencyAssetType
    expect(assetType["@type"]).toEqual("CURRENCY_TOKEN")
    expect(assetType.contract).toEqual("APTOS:0x000000000000000000000000000000000000000000000000000000000001234")
  })

  test("get CurrencyId from APT asset type", async () => {
    const currencyId = getCurrencyId({
      "@type": "CURRENCY_NATIVE",
      blockchain: Blockchain.APTOS,
    })
    expect(currencyId).toBe("APTOS:MHgxOjphcHRvc19jb2luOjpBcHRvc0NvaW4=")
  })

  test("get CurrencyId from token asset type", async () => {
    const currency = getCurrencyId({
      "@type": "CURRENCY_TOKEN",
      contract: toUnionContractAddress(
        `${Blockchain.APTOS}:0x000000000000000000000000000000000000000000000000000000000001234`,
      ),
    })
    expect(currency).toEqual("APTOS:0x000000000000000000000000000000000000000000000000000000000001234")
  })
})
