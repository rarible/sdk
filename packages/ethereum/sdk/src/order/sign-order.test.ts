import { EVM_ZERO_ADDRESS, toEVMAddress } from "@rarible/types"
import { createGanacheProvider, DEV_PK_5 } from "@rarible/ethereum-sdk-test-common"
import { toBigNumber } from "@rarible/types"
import { getEthereumConfig } from "../config"
import { createEthereumProviders } from "../common/test/create-test-providers"
import { signOrder } from "./sign-order"
import { TEST_ORDER_TEMPLATE } from "./test/order"
import type { SimpleOrder } from "./types"

const { provider, wallets } = createGanacheProvider(DEV_PK_5)

const { providers } = createEthereumProviders(provider, wallets[0])

/**
 * @group provider/dev
 */
describe.each(providers)("signOrder", ethereum => {
  const config = getEthereumConfig("dev-ethereum")
  const getConfig = async () => config
  const signOrderE2e = signOrder.bind(null, ethereum, getConfig)

  test.skip(`[${ethereum.constructor.name}] should sign legacy orders`, async () => {
    const signer = await ethereum.getFrom()
    const order: SimpleOrder = {
      ...TEST_ORDER_TEMPLATE,
      type: "RARIBLE_V1",
      data: {
        dataType: "LEGACY",
        fee: 100,
      },
      maker: toEVMAddress(signer),
    }

    const signature = await signOrderE2e(order)

    expect(signature).toEqual(
      "0x5fec2e13b0ad828fd4bd8908ca695518ecf8256218cf6d0c1fb3ecb460c8510222a2d52b9946c761217fcadfa88f7e120707c4fa1c441fb6c34f5bf5df821b741b",
    )
  })

  test(`[${ethereum.constructor.name}] should sign v2 erc1155 orders`, async () => {
    const signer = await ethereum.getFrom()
    const signature = await signOrderE2e({
      ...TEST_ORDER_TEMPLATE,
      make: {
        assetType: {
          assetClass: "ERC1155",
          contract: toEVMAddress(EVM_ZERO_ADDRESS),
          tokenId: toBigNumber("1"),
        },
        value: toBigNumber("5"),
      },
      take: {
        assetType: {
          assetClass: "ERC20",
          contract: toEVMAddress(EVM_ZERO_ADDRESS),
        },
        value: toBigNumber("10"),
      },
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V1",
        payouts: [],
        originFees: [],
      },
      maker: toEVMAddress(signer),
    })
    expect(signature).toEqual(
      "0x643d42a3bddd53f4118657ce99c57c94f604e03b1e98d7e3dbb65057919b6c46799f9b8d604cc2b42a61c563214897188995bfe529f18ed6574fd9a5fa6714f71c",
    )
  })

  test(`[${ethereum.constructor.name}] should sign v2 orders`, async () => {
    const signer = await ethereum.getFrom()
    const signature = await signOrderE2e({
      ...TEST_ORDER_TEMPLATE,
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V1",
        payouts: [],
        originFees: [],
      },
      maker: toEVMAddress(signer),
    })
    expect(signature).toEqual(
      "0xc959c911e719426947215dc612f937b79f2e9e3cec0d98237552a5a87c535493209a0a9c0dd3a9f1be39faa615076d4e47f388fa76bbb6c66b6e82d7c6669e251b",
    )
  })

  test(`[${ethereum.constructor.name}] should sign v2 data v2 orders`, async () => {
    const signer = await ethereum.getFrom()
    const signature = await signOrderE2e({
      ...TEST_ORDER_TEMPLATE,
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("1000000"),
      },
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V2",
        payouts: [],
        originFees: [],
        isMakeFill: true,
      },
      maker: toEVMAddress(signer),
    })

    expect(signature).toEqual(
      "0xa032ae7d5300028a4b76960290818e9c5488c98bb74beadc96204dd2d23a629469a3b5a89759d8aa14bfa70ef59b3ed2ba5c643877b9838cc8d8a94a0b4acf0d1b",
    )
  })

  test(`[${ethereum.constructor.name}] should sign v2 data v3 orders`, async () => {
    const signer = await ethereum.getFrom()
    const signature = await signOrderE2e({
      ...TEST_ORDER_TEMPLATE,
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("1000000"),
      },
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V3",
        payouts: [],
        originFees: [],
        isMakeFill: true,
      },
      maker: toEVMAddress(signer),
    })
    expect(signature).toEqual(
      "0x66cad26ca1563aa84c18c03ebe6186cd1f751c72f1f69ffb7c9c223d0e74e52f09efce8f91ca6490142d5cae20a676dde7eec1758a4bbac0a78e2e3847878b0f1b",
    )
  })
})
