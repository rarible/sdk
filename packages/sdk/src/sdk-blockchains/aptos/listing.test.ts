import { createTestAptosState, createTestCollectionAndMint, DEFAULT_PK } from "@rarible/aptos-sdk/src/common/test"
import { BUYER_PK } from "@rarible/aptos-sdk/build/common/test"
import { toItemId } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { toBn } from "@rarible/utils"
import { generateExpirationDate } from "../../common/suite/order"
import { awaitOrder } from "../../common/test/await-order"
import { awaitBalance } from "../../common/test/await-balance"
import { createSdk } from "./common/tests/create-sdk"
import { APTOS_CURRENCY_ID_ZERO_ADDRESS, convertAptosToUnionAddress } from "./common"

describe("Aptos Orders", () => {
  const sellerState = createTestAptosState(DEFAULT_PK)
  const sdkSeller = createSdk(sellerState, "development")
  const buyerState = createTestAptosState(BUYER_PK)
  const sdkBuyer = createSdk(buyerState, "development")
  const feeAddress = convertAptosToUnionAddress("0x6a98afd2d82f80f2dc535fac0a5d886281f9fe6a2b44a1511af70cdfa106ffe1")

  test("sell & buy with CurrencyId", async () => {
    const { tokenAddress } = await createTestCollectionAndMint(sellerState)
    const sellOrder = await sdkSeller.order.sell({
      itemId: toItemId(`APTOS:${tokenAddress}`),
      amount: 1,
      price: "0.02",
      currency: APTOS_CURRENCY_ID_ZERO_ADDRESS,
      expirationDate: generateExpirationDate(),
    })

    await awaitOrder(sdkSeller, sellOrder)
    await sdkBuyer.order.buy({
      orderId: sellOrder,
      amount: 1,
    })
  })

  test("sell & buy with Aptos asset type", async () => {
    const { tokenAddress } = await createTestCollectionAndMint(sellerState)
    const sellOrder = await sdkSeller.order.sell({
      itemId: toItemId(`APTOS:${tokenAddress}`),
      amount: 1,
      price: "0.02",
      currency: {
        "@type": "CURRENCY_NATIVE",
        blockchain: Blockchain.APTOS,
      },
      expirationDate: generateExpirationDate(),
    })

    await awaitOrder(sdkSeller, sellOrder)
    await sdkBuyer.order.buy({
      orderId: sellOrder,
      amount: 1,
    })
  })

  test("sell & buy with origin fees", async () => {
    const { tokenAddress } = await createTestCollectionAndMint(sellerState)
    const sellOrder = await sdkSeller.order.sell({
      itemId: toItemId(`APTOS:${tokenAddress}`),
      amount: 1,
      price: "0.02",
      currency: {
        "@type": "CURRENCY_NATIVE",
        blockchain: Blockchain.APTOS,
      },
      expirationDate: generateExpirationDate(),
      originFees: [
        {
          account: feeAddress,
          value: 1000,
        },
      ],
    })
    const originFeeStartBalance = await sdkBuyer.balances.getBalance(feeAddress, APTOS_CURRENCY_ID_ZERO_ADDRESS)

    await awaitOrder(sdkSeller, sellOrder)
    await sdkBuyer.order.buy({
      orderId: sellOrder,
      amount: 1,
    })
    await awaitBalance(sdkSeller, feeAddress, APTOS_CURRENCY_ID_ZERO_ADDRESS, toBn("0.002").plus(originFeeStartBalance))
  })

  test("buy throws error when origin fees is passed", async () => {
    const { tokenAddress } = await createTestCollectionAndMint(sellerState)
    const sellOrder = await sdkSeller.order.sell({
      itemId: toItemId(`APTOS:${tokenAddress}`),
      amount: 1,
      price: "0.02",
      currency: {
        "@type": "CURRENCY_NATIVE",
        blockchain: Blockchain.APTOS,
      },
      expirationDate: generateExpirationDate(),
    })

    await awaitOrder(sdkSeller, sellOrder)

    let err: Error | undefined
    try {
      await sdkBuyer.order.buy({
        orderId: sellOrder,
        amount: 1,
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
    expect(err?.message).toBe("Origin fees is not supported in buy operation. You can set it during sell")
  })
})
