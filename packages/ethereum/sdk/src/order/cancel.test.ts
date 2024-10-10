import {
  awaitAll,
  createE2eProvider,
  deployTestErc1155,
  deployTestErc20,
  deployTestErc721,
} from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toEVMAddress, toBigNumber, toBinary } from "@rarible/types"
import type { OrderForm } from "@rarible/ethereum-api-client"
import type { EVMAddress } from "@rarible/ethereum-api-client"
import { getEthereumConfig } from "../config"
import { delay, retry } from "../common/retry"
import { getSimpleSendWithInjects, sentTxConfirm } from "../common/send-transaction"
import { getApis as getApisTemplate } from "../common/apis"
import { createRaribleSdk } from "../index"
import { createErc721V3Collection } from "../common/mint"
import { MintResponseTypeEnum } from "../nft/mint"
import { DEV_PK_1 } from "../common/test/test-credentials"
import type { EthereumNetwork } from "../types"
import { MIN_PAYMENT_VALUE } from "../common/check-min-payment-value"
import { cancel } from "./cancel"
import { signOrder } from "./sign-order"
import { UpsertOrder } from "./upsert-order"
import { TEST_ORDER_TEMPLATE } from "./test/order"
import { OrderFiller } from "./fill-order"
import { ItemType } from "./fill-order/seaport-utils/constants"
import { createSeaportOrder } from "./test/order-opensea"
import { awaitOrder } from "./test/await-order"
import { getOpenseaEthTakeData } from "./test/get-opensea-take-data"
import { approve as approveTemplate } from "./approve"
import { getEndDateAfterMonth } from "./test/utils"

/**
 * @group provider/dev
 */
describe("cancel order", () => {
  const { provider, wallet } = createE2eProvider(DEV_PK_1)
  const web3 = new Web3(provider)
  const ethereum = new Web3Ethereum({ web3 })
  const env: EthereumNetwork = "dev-ethereum"
  const config = getEthereumConfig(env)
  const getConfig = async () => config
  const getApis = getApisTemplate.bind(null, ethereum, env)

  const sign = signOrder.bind(null, ethereum, getConfig)

  const getBaseOrderFee = async () => 0
  const send = getSimpleSendWithInjects()
  const approve = approveTemplate.bind(null, ethereum, send, getConfig)
  const orderService = new OrderFiller(ethereum, send, getConfig, getApis, getBaseOrderFee, env)

  const it = awaitAll({
    testErc20: deployTestErc20(web3, "Test1", "TST1"),
    testErc721: deployTestErc721(web3, "Test", "TST"),
    testErc1155: deployTestErc1155(web3, "Test"),
  })
  let from: EVMAddress

  beforeAll(async () => {
    from = toEVMAddress(await ethereum.getFrom())
  })

  test("ExchangeV2 should work", async () => {
    await sentTxConfirm(it.testErc721.methods.mint(from, "10", "0x"), { from })
    const form: OrderForm = {
      ...TEST_ORDER_TEMPLATE,
      make: {
        assetType: {
          assetClass: "ERC721",
          contract: toEVMAddress(it.testErc721.options.address),
          tokenId: toBigNumber("10"),
        },
        value: toBigNumber("10"),
      },
      take: {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber(MIN_PAYMENT_VALUE.toFixed()),
      },
      salt: toBigNumber("10") as any,
      maker: toEVMAddress(wallet.getAddressString()),
      type: "RARIBLE_V2",
      data: {
        dataType: "RARIBLE_V2_DATA_V1",
        payouts: [],
        originFees: [],
      },
      signature: toBinary("0x"),
      end: getEndDateAfterMonth(),
    }
    const { tx, order } = await testOrder(form)
    const events = await tx.getEvents()
    expect(events.some(e => e.event === "Cancel" && e.returnValues.hash === order.hash)).toBe(true)
  })

  async function testOrder(form: OrderForm) {
    const checkLazyOrder = <T>(form: T) => Promise.resolve(form)
    const upserter = new UpsertOrder(orderService, send, getConfig, checkLazyOrder, approve, sign, getApis, ethereum)

    const order = await upserter.upsert({ order: form })
    const tx = await cancel(checkLazyOrder, ethereum, send, getConfig, getApis, order)
    await tx.wait()
    return { tx, order }
  }
})

describe.skip("test of cancelling seaport rinkeby order", () => {
  const { provider: providerSeller } = createE2eProvider(
    "0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c",
    {
      networkId: 4,
      rpcUrl: "https://node-rinkeby.rarible.com",
    },
  )
  const web3Seller = new Web3(providerSeller as any)
  const ethereumSeller = new Web3Ethereum({ web3: web3Seller, gas: 1000000 })
  const sdkSeller = createRaribleSdk(ethereumSeller, "testnet")

  const rinkebyErc721V3ContractAddress = toEVMAddress("0x6ede7f3c26975aad32a475e1021d8f6f39c89d82")

  const send = getSimpleSendWithInjects()

  test("cancel seaport order", async () => {
    const accountAddressBuyer = toEVMAddress(await ethereumSeller.getFrom())
    console.log("accountAddressBuyer", accountAddressBuyer)
    console.log("seller", await ethereumSeller.getFrom())

    const sellItem = await sdkSeller.nft.mint({
      collection: createErc721V3Collection(rinkebyErc721V3ContractAddress),
      uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
      royalties: [],
      lazy: false,
    })
    if (sellItem.type === MintResponseTypeEnum.ON_CHAIN) {
      await sellItem.transaction.wait()
    }

    await delay(10000)
    const make = {
      itemType: ItemType.ERC721,
      token: sellItem.contract,
      identifier: sellItem.tokenId,
    } as const
    const take = getOpenseaEthTakeData("10000000000")
    const orderHash = await createSeaportOrder(ethereumSeller, send, make, take)

    const order = await awaitOrder(sdkSeller, orderHash)

    const cancelTx = await sdkSeller.order.cancel(order)
    await cancelTx.wait()

    await retry(10, 3000, async () => {
      const order = await sdkSeller.apis.order.getValidatedOrderByHash({ hash: orderHash })
      if (order.status !== "CANCELLED") {
        throw new Error("Order has not been cancelled")
      }
    })
  })
})

describe.skip("test of cancelling looksrare rinkeby order", () => {
  const { provider: providerSeller } = createE2eProvider(
    "0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c",
    {
      networkId: 4,
      rpcUrl: "https://node-rinkeby.rarible.com",
    },
  )
  const web3Seller = new Web3(providerSeller as any)
  const ethereumSeller = new Web3Ethereum({ web3: web3Seller, gas: 1000000 })
  const sdkSeller = createRaribleSdk(ethereumSeller, "testnet")

  test("cancel seaport order", async () => {
    const orderHash = "0x924dd3b3421099ff58eefda2505c7ac8f33b3d579640198dea09dd4c4f5993e4"
    const order = await awaitOrder(sdkSeller, orderHash)
    const cancelTx = await sdkSeller.order.cancel(order)
    await cancelTx.wait()

    await retry(10, 3000, async () => {
      const order = await sdkSeller.apis.order.getValidatedOrderByHash({ hash: orderHash })
      if (order.status !== "CANCELLED") {
        throw new Error("Order has not been cancelled")
      }
    })
  })
})
