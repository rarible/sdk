import { createTestAptosState, createTestCollectionAndMint, DEFAULT_PK } from "@rarible/aptos-sdk/src/common/test"
import { toItemId } from "@rarible/types"
import { BUYER_PK } from "@rarible/aptos-sdk/build/common/test"
import { toBn } from "@rarible/utils"
import { generateExpirationDate } from "../../common/suite/order"
import { awaitOrder } from "../../common/test/await-order"
import { awaitBalance } from "../../common/test/await-balance"
import { awaitItemSupply } from "../../common/test/await-item-supply"
import {
  APTOS_CURRENCY_ID_ZERO_ADDRESS,
  convertAptosToUnionAddress,
  convertAptosToUnionCollectionId,
  convertAptosToUnionItemId,
} from "./common"
import { createSdk } from "./common/tests/create-sdk"

describe("aptos bid", () => {
  const sellerState = createTestAptosState(DEFAULT_PK)
  const sdkSeller = createSdk(sellerState, "development")
  const buyerState = createTestAptosState(BUYER_PK)
  const sdkBuyer = createSdk(buyerState, "development")
  const feeAddress = convertAptosToUnionAddress("0x6a98afd2d82f80f2dc535fac0a5d886281f9fe6a2b44a1511af70cdfa106ffe1")

  test("bid & accept bid", async () => {
    const { tokenAddress } = await createTestCollectionAndMint(sellerState)
    const itemId = toItemId(`APTOS:${tokenAddress}`)
    await awaitItemSupply(sdkSeller, itemId, "1")
    const bidOrder = await sdkBuyer.order.bid({
      itemId,
      amount: 1,
      price: "0.002",
      currency: APTOS_CURRENCY_ID_ZERO_ADDRESS,
      expirationDate: generateExpirationDate(),
      originFees: [
        {
          account: feeAddress,
          value: 1000,
        },
      ],
    })

    await awaitOrder(sdkSeller, bidOrder)
    const originFeeStartBalance = await sdkBuyer.balances.getBalance(feeAddress, APTOS_CURRENCY_ID_ZERO_ADDRESS)

    await sdkSeller.order.acceptBid({
      orderId: bidOrder,
      amount: 1,
    })
    await awaitBalance(
      sdkSeller,
      feeAddress,
      APTOS_CURRENCY_ID_ZERO_ADDRESS,
      toBn("0.0002").plus(originFeeStartBalance),
    )
  })

  test("collection bid & accept bid", async () => {
    const { collectionAddress, tokenAddress } = await createTestCollectionAndMint(sellerState)
    const itemId = toItemId(`APTOS:${tokenAddress}`)
    await awaitItemSupply(sdkSeller, itemId, "1")

    const bidOrder = await sdkBuyer.order.bid({
      collectionId: convertAptosToUnionCollectionId(collectionAddress),
      amount: 1,
      price: "0.002",
      currency: APTOS_CURRENCY_ID_ZERO_ADDRESS,
      expirationDate: generateExpirationDate(),
      originFees: [
        {
          account: feeAddress,
          value: 1000,
        },
      ],
    })
    const originFeeStartBalance = await sdkBuyer.balances.getBalance(feeAddress, APTOS_CURRENCY_ID_ZERO_ADDRESS)

    await awaitOrder(sdkSeller, bidOrder)
    await sdkSeller.order.acceptBid({
      orderId: bidOrder,
      amount: 1,
      itemId: convertAptosToUnionItemId(tokenAddress),
    })
    await awaitBalance(
      sdkSeller,
      feeAddress,
      APTOS_CURRENCY_ID_ZERO_ADDRESS,
      toBn("0.0002").plus(originFeeStartBalance),
    )
  })

  test("accept bid should throws error when originFees is passed", async () => {
    const { collectionAddress, tokenAddress } = await createTestCollectionAndMint(sellerState)
    const itemId = toItemId(`APTOS:${tokenAddress}`)
    await awaitItemSupply(sdkSeller, itemId, "1")

    const bidOrder = await sdkBuyer.order.bid({
      collectionId: convertAptosToUnionCollectionId(collectionAddress),
      amount: 1,
      price: "0.002",
      currency: APTOS_CURRENCY_ID_ZERO_ADDRESS,
      expirationDate: generateExpirationDate(),
    })

    await awaitOrder(sdkSeller, bidOrder)

    let err: Error | undefined
    try {
      await sdkSeller.order.acceptBid({
        orderId: bidOrder,
        amount: 1,
        itemId: convertAptosToUnionItemId(tokenAddress),
        originFees: [
          {
            account: feeAddress,
            value: 1000,
          },
        ],
      })
    } catch (e: any) {
      err = e
    }
    expect(err).toBeTruthy()
    expect(err?.message).toBe("Origin fees is not supported in acceptBid operation. You can set it during bid")
  })
})
