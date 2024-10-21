import { TestUtils } from "@rarible/aptos-sdk"
import { toCollectionId, toItemId } from "@rarible/types"
import { toBn } from "@rarible/utils"
import { createV1Token } from "@rarible/aptos-sdk/src/common/test"
import { Blockchain } from "@rarible/api-client"
import { generateExpirationDate } from "../../common/suite/order"
import { awaitOrder } from "../../common/test/await-order"
import { awaitBalance } from "../../common/test/await-balance"
import { awaitItemSupply } from "../../common/test/await-item-supply"
import {
  APTOS_APT_CURRENCY,
  convertAptosToUnionAddress,
  convertAptosToUnionCollectionId,
  convertAptosToUnionItemId,
} from "./common"
import { createSdk } from "./common/tests/create-sdk"

describe("aptos bid", () => {
  const sellerState = TestUtils.createTestAptosState(TestUtils.DEFAULT_PK)
  const sdkSeller = createSdk(sellerState, "testnet")
  const buyerState = TestUtils.createTestAptosState(TestUtils.BUYER_PK)
  const sdkBuyer = createSdk(buyerState, "testnet")
  const feeAddress = convertAptosToUnionAddress("0x6a98afd2d82f80f2dc535fac0a5d886281f9fe6a2b44a1511af70cdfa106ffe1")

  test("token v1 bid & accept bid", async () => {
    await createV1Token(sellerState)
    const itemId = toItemId(`APTOS:0x3115b0cb265c1cd1ce5cf5e26730661244e08bd799efa4ea75b93076f0bab374`)

    const bidOrder = await sdkBuyer.order.bid({
      itemId,
      amount: 1,
      price: "0.002",
      currency: APTOS_APT_CURRENCY,
      expirationDate: generateExpirationDate(),
      originFees: [
        {
          account: feeAddress,
          value: 1000,
        },
      ],
    })

    await awaitOrder(sdkSeller, bidOrder)
    const originFeeStartBalance = await sdkBuyer.balances.getBalance(feeAddress, APTOS_APT_CURRENCY)

    await sdkSeller.order.acceptBid({
      orderId: bidOrder,
      amount: 1,
    })
    await awaitBalance(sdkSeller, feeAddress, APTOS_APT_CURRENCY, toBn("0.0002").plus(originFeeStartBalance))
  })

  test("bid & accept bid", async () => {
    const { tokenAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    const itemId = toItemId(`APTOS:${tokenAddress}`)
    await awaitItemSupply(sdkSeller, itemId, "1")
    const bidOrder = await sdkBuyer.order.bid({
      itemId,
      amount: 1,
      price: "0.002",
      currency: APTOS_APT_CURRENCY,
      expirationDate: generateExpirationDate(),
      originFees: [
        {
          account: feeAddress,
          value: 1000,
        },
      ],
    })

    await awaitOrder(sdkSeller, bidOrder)
    const originFeeStartBalance = await sdkBuyer.balances.getBalance(feeAddress, APTOS_APT_CURRENCY)

    await sdkSeller.order.acceptBid({
      orderId: bidOrder,
      amount: 1,
    })
    await awaitBalance(sdkSeller, feeAddress, APTOS_APT_CURRENCY, toBn("0.0002").plus(originFeeStartBalance))
  })

  test("collection bid & accept bid", async () => {
    const { collectionAddress, tokenAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    const itemId = toItemId(`APTOS:${tokenAddress}`)
    await awaitItemSupply(sdkSeller, itemId, "1")

    const bidOrder = await sdkBuyer.order.bid({
      collectionId: convertAptosToUnionCollectionId(collectionAddress),
      amount: 1,
      price: "0.002",
      currency: APTOS_APT_CURRENCY,
      expirationDate: generateExpirationDate(),
      originFees: [
        {
          account: feeAddress,
          value: 1000,
        },
      ],
    })
    const originFeeStartBalance = await sdkBuyer.balances.getBalance(feeAddress, APTOS_APT_CURRENCY)

    await awaitOrder(sdkSeller, bidOrder)
    await sdkSeller.order.acceptBid({
      orderId: bidOrder,
      amount: 1,
      itemId: convertAptosToUnionItemId(tokenAddress),
    })
    await awaitBalance(sdkSeller, feeAddress, APTOS_APT_CURRENCY, toBn("0.0002").plus(originFeeStartBalance))
  })

  test("token v1 collection bid & accept bid", async () => {
    await createV1Token(sellerState)
    const itemId = toItemId(`${Blockchain.APTOS}:0x3115b0cb265c1cd1ce5cf5e26730661244e08bd799efa4ea75b93076f0bab374`)
    const collectionId = toCollectionId(
      `${Blockchain.APTOS}:0x2543bb9d3a44e3dcad2c98acd97aed692a3e8a1a5290ca6e1df244bca1084f49`,
    )
    const bidOrder = await sdkBuyer.order.bid({
      collectionId,
      amount: 1,
      price: "0.002",
      currency: APTOS_APT_CURRENCY,
      expirationDate: generateExpirationDate(),
      originFees: [
        {
          account: feeAddress,
          value: 1000,
        },
      ],
    })
    const originFeeStartBalance = await sdkBuyer.balances.getBalance(feeAddress, APTOS_APT_CURRENCY)

    await awaitOrder(sdkSeller, bidOrder)
    await sdkSeller.order.acceptBid({
      orderId: bidOrder,
      amount: 1,
      itemId: itemId,
    })
    await awaitBalance(sdkSeller, feeAddress, APTOS_APT_CURRENCY, toBn("0.0002").plus(originFeeStartBalance))
  })

  test("accept bid should throws error when originFees is passed", async () => {
    const { collectionAddress, tokenAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    const itemId = toItemId(`APTOS:${tokenAddress}`)
    await awaitItemSupply(sdkSeller, itemId, "1")

    const bidOrder = await sdkBuyer.order.bid({
      collectionId: convertAptosToUnionCollectionId(collectionAddress),
      amount: 1,
      price: "0.002",
      currency: APTOS_APT_CURRENCY,
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
