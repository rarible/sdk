import { FlowWallet } from "@rarible/sdk-wallet"
import * as fcl from "@onflow/fcl"
import { toCurrencyId, toUnionAddress, toUnionContractAddress } from "@rarible/types"
import type { FlowAssetTypeFt } from "@rarible/api-client/build/models/AssetType"
import { toBn } from "@rarible/utils/build/bn"
import { createApisSdk } from "../../common/apis"
import { createSdk } from "../../common/test/create-sdk"
import { convertFlowUnionAddress } from "./common/converters"
import { createTestFlowAuth } from "./test/create-test-flow-auth"
import { createFlowSdk } from "./index"

describe("Test flow balance function", () => {
  beforeAll(() => {
    fcl.config().put("accessNode.api", "https://access-mainnet-beta.onflow.org")
  })

  const address = convertFlowUnionAddress("0x324c4173e0175672")
  const wallet = new FlowWallet(fcl)
  const sdk = createFlowSdk(wallet, createApisSdk("prod"), "mainnet")

  test("Should get FT balance for account", async () => {
    const balance1 = await sdk.balances.getBalance(address, {
      "@type": "FLOW_FT",
      contract: toUnionContractAddress("FLOW:A.0x1654653399040a61.FlowToken"),
    })
    expect(balance1.toString()).toEqual("0.001")

    const balance2 = await sdk.balances.getBalance(address, {
      "@type": "FLOW_FT",
      contract: toUnionContractAddress("FLOW:A.0x3c5959b568896393.FUSD"),
    })
    expect(balance2.toString()).toEqual("0")
  })

  test("Should get FT balance for account without SDK wallet", async () => {
    const sdk = createFlowSdk(undefined, createApisSdk("prod"), "mainnet")
    const balance1 = await sdk.balances.getBalance(address, {
      "@type": "FLOW_FT",
      contract: toUnionContractAddress("FLOW:A.0x1654653399040a61.FlowToken"),
    })
    expect(balance1.toString()).toEqual("0.001")

    const balance2 = await sdk.balances.getBalance(address, {
      "@type": "FLOW_FT",
      contract: toUnionContractAddress("FLOW:A.0x3c5959b568896393.FUSD"),
    })
    expect(balance2.toString()).toEqual("0")
  })

  test.skip("Should get FT balance for account with CurrencyId", async () => {
    const balance1 = await sdk.balances.getBalance(address, toCurrencyId("FLOW:A.0x1654653399040a61.FlowToken"))
    expect(balance1.toString()).toEqual("0.001")

    const balance2 = await sdk.balances.getBalance(address, toCurrencyId("FLOW:A.0x3c5959b568896393.FUSD"))
    expect(balance2.toString()).toEqual("0")
  })
})

describe.skip("Test flow transfer function", () => {
  const { authUser1 } = createTestFlowAuth(fcl)

  test("transfer Flow", async () => {
    const wallet = new FlowWallet(fcl, authUser1)
    const unionSdk = createSdk(wallet, "testnet")
    const recipient = toUnionAddress("FLOW:0x97d54357e9938fd0")

    const flowAssetType = {
      "@type": "FLOW_FT",
      contract: toUnionContractAddress("FLOW:A.0x7e60df042a9c0868.FlowToken"),
    } as FlowAssetTypeFt

    const startBalance = await unionSdk.balances.getBalance(recipient, flowAssetType)

    await unionSdk.balances.transfer({
      recipient,
      amount: "0.001",
      currency: flowAssetType,
    })
    const finishBalance = await unionSdk.balances.getBalance(recipient, flowAssetType)
    expect(toBn(finishBalance).minus(startBalance).toString()).toBe("0.001")
  })
})
