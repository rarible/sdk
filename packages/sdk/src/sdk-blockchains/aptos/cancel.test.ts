import { TestUtils } from "@rarible/aptos-sdk"
import { toItemId } from "@rarible/types"
import { generateExpirationDate } from "../../common/suite/order"
import { awaitOrder } from "../../common/test/await-order"
import { APTOS_CURRENCY_ID_ZERO_ADDRESS, convertAptosToUnionCollectionId } from "./common"
import { createSdk } from "./common/tests/create-sdk"

describe("cancel aptos orders", () => {
  const sellerState = TestUtils.createTestAptosState(TestUtils.DEFAULT_PK)
  const sdkSeller = createSdk(sellerState, "development")
  const buyerState = TestUtils.createTestAptosState(TestUtils.BUYER_PK)
  const sdkBuyer = createSdk(buyerState, "development")

  test("cancel sell order", async () => {
    const { tokenAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    const sellOrder = await sdkSeller.order.sell({
      itemId: toItemId(`APTOS:${tokenAddress}`),
      amount: 1,
      price: "0.02",
      currency: APTOS_CURRENCY_ID_ZERO_ADDRESS,
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
    const bidOrder = await sdkBuyer.order.bid({
      collectionId: convertAptosToUnionCollectionId(collectionAddress),
      amount: 1,
      price: "0.002",
      currency: APTOS_CURRENCY_ID_ZERO_ADDRESS,
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
    const { tokenAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    const bidOrder = await sdkBuyer.order.bid({
      itemId: toItemId(`APTOS:${tokenAddress}`),
      amount: 1,
      price: "0.002",
      currency: APTOS_CURRENCY_ID_ZERO_ADDRESS,
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
