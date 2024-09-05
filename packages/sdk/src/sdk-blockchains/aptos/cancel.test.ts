import { TestUtils } from "@rarible/aptos-sdk"
import { toItemId } from "@rarible/types"
import { createV1Token } from "@rarible/aptos-sdk/build/common/test"
import { generateExpirationDate } from "../../common/suite/order"
import { awaitOrder } from "../../common/test/await-order"
import { awaitCollection } from "../../common/test/await-collection"
import { APTOS_APT_CURRENCY, convertAptosToUnionCollectionId } from "./common"
import { createSdk } from "./common/tests/create-sdk"

describe("cancel aptos orders", () => {
  const sellerState = TestUtils.createTestAptosState(TestUtils.DEFAULT_PK)
  const sdkSeller = createSdk(sellerState, "testnet")
  const buyerState = TestUtils.createTestAptosState(TestUtils.BUYER_PK)
  const sdkBuyer = createSdk(buyerState, "testnet")

  test("cancel sell order", async () => {
    const { tokenAddress, collectionAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    await awaitCollection(sdkSeller, convertAptosToUnionCollectionId(collectionAddress))
    const sellOrder = await sdkSeller.order.sell({
      itemId: toItemId(`APTOS:${tokenAddress}`),
      amount: 1,
      price: "0.02",
      currency: APTOS_APT_CURRENCY,
      expirationDate: generateExpirationDate(),
    })
    await awaitOrder(sdkSeller, sellOrder)
    console.log("sellOrder", sellOrder)
    const tx = await sdkSeller.order.cancel({
      orderId: sellOrder,
    })
    expect(tx.hash()).toBeTruthy()
    await awaitOrder(sdkSeller, sellOrder, order => order.status === "CANCELLED")
  })

  test("cancel sell order with v1 token", async () => {
    await createV1Token(sellerState)
    const itemId = toItemId(`APTOS:0x3115b0cb265c1cd1ce5cf5e26730661244e08bd799efa4ea75b93076f0bab374`)
    const sellOrder = await sdkSeller.order.sell({
      itemId,
      amount: 1,
      price: "0.02",
      currency: APTOS_APT_CURRENCY,
      expirationDate: generateExpirationDate(),
    })
    await awaitOrder(sdkSeller, sellOrder)
    const tx = await sdkSeller.order.cancel({
      orderId: sellOrder,
    })
    expect(tx.hash()).toBeTruthy()
    await awaitOrder(sdkSeller, sellOrder, order => order.status === "CANCELLED")
  })

  test("cancel collection offer", async () => {
    const { collectionAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    await awaitCollection(sdkSeller, convertAptosToUnionCollectionId(collectionAddress))

    const bidOrder = await sdkBuyer.order.bid({
      collectionId: convertAptosToUnionCollectionId(collectionAddress),
      amount: 1,
      price: "0.002",
      currency: APTOS_APT_CURRENCY,
      expirationDate: generateExpirationDate(),
    })

    await awaitOrder(sdkSeller, bidOrder)
    const buyTx = await sdkBuyer.order.cancel({
      orderId: bidOrder,
    })
    expect(buyTx.hash()).toBeTruthy()
    await awaitOrder(sdkSeller, bidOrder, order => order.status === "CANCELLED")
  })

  test("cancel bid", async () => {
    const { tokenAddress, collectionAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    await awaitCollection(sdkSeller, convertAptosToUnionCollectionId(collectionAddress))
    const bidOrder = await sdkBuyer.order.bid({
      itemId: toItemId(`APTOS:${tokenAddress}`),
      amount: 1,
      price: "0.002",
      currency: APTOS_APT_CURRENCY,
      expirationDate: generateExpirationDate(),
    })

    await awaitOrder(sdkSeller, bidOrder)
    const tx = await sdkBuyer.order.cancel({
      orderId: bidOrder,
    })
    expect(tx.hash()).toBeTruthy()
    await awaitOrder(sdkSeller, bidOrder, order => order.status === "CANCELLED")
  })
})
