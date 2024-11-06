import { Blockchain } from "@rarible/api-client"
import { toBn } from "@rarible/utils"
import { DEV_PK_1, DEV_PK_2 } from "./test/common"
import type { EVMTestSuite } from "./test/suite"
import { EVMTestSuiteFactory } from "./test/suite"

describe("cancel", () => {
  const suiteFactory = new EVMTestSuiteFactory(Blockchain.ETHEREUM)
  let suiteDev1: EVMTestSuite<Blockchain.ETHEREUM>
  let suiteDev2: EVMTestSuite<Blockchain.ETHEREUM>

  beforeAll(async () => {
    suiteDev1 = await suiteFactory.create(DEV_PK_1)
    suiteDev2 = await suiteFactory.create(DEV_PK_2)
  })

  afterAll(() => {
    suiteDev1.destroy()
    suiteDev2.destroy()
  })

  test("erc721 sell order", async () => {
    const erc721 = suiteDev1.contracts.getContract("erc721_1")
    const erc20Mintable = suiteDev1.contracts.getContract("erc20_mintable_1")
    const { itemId } = await suiteDev1.items.mintAndWait(erc721.collectionId)
    const orderId = await suiteDev1.orders.sellWithPrepare({
      itemId,
      price: toBn("200000000000000"),
      currency: erc20Mintable.assetType,
    })

    await suiteDev1.orders.cancelOrder(orderId)
  })

  test("erc1155 sell order", async () => {
    const erc1155 = suiteDev1.contracts.getContract("erc1155_1")
    const erc20Mintable = suiteDev1.contracts.getContract("erc20_mintable_1")
    const { itemId } = await suiteDev1.items.mintAndWait(erc1155.collectionId, { supply: 100 })

    const orderId = await suiteDev1.orders.sellWithPrepare({
      itemId,
      price: toBn("200000000000000"),
      currency: erc20Mintable.assetType,
      quantity: 10,
    })

    await suiteDev1.orders.cancelOrder(orderId)
  })

  test("erc721 bid order", async () => {
    const erc721 = suiteDev1.contracts.getContract("erc721_1")
    const erc20Mintable = suiteDev1.contracts.getContract("erc20_mintable_1")
    const { itemId } = await suiteDev1.items.mintAndWait(erc721.collectionId)

    const orderId = await suiteDev2.orders.bid({
      itemId,
      price: toBn("200000000000000"),
      currency: erc20Mintable.assetType,
    })

    await suiteDev2.orders.cancelOrder(orderId)
  })

  test("erc1155 bid order", async () => {
    const erc1155 = suiteDev1.contracts.getContract("erc1155_1")
    const erc20Mintable = suiteDev1.contracts.getContract("erc20_mintable_1")
    const { itemId } = await suiteDev1.items.mintAndWait(erc1155.collectionId, { supply: 100 })

    const orderId = await suiteDev2.orders.bid({
      itemId,
      price: toBn("200000000000000"),
      quantity: 10,
      currency: erc20Mintable.assetType,
    })

    await suiteDev2.orders.cancelOrder(orderId)
  })

  test("erc721 collection bid order", async () => {
    const erc721 = suiteDev1.contracts.getContract("erc721_1")
    const erc20Mintable = suiteDev1.contracts.getContract("erc20_mintable_1")

    const orderId = await suiteDev2.orders.bidByCollection({
      collectionId: erc721.collectionId,
      price: toBn("200000000000000"),
      currency: erc20Mintable.assetType,
    })

    await suiteDev2.orders.cancelOrder(orderId)
  })
})
