import { TestUtils } from "@rarible/aptos-sdk"
import { toItemId, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { toBn } from "@rarible/utils"
import { createV1TokenWithFeePayer } from "@rarible/aptos-sdk/build/common/test"
import { generateExpirationDate } from "../../common/suite/order"
import { awaitOrder } from "../../common/test/await-order"
import { awaitBalance } from "../../common/test/await-balance"
import { awaitCollection } from "../../common/test/await-collection"
import { createSdk } from "./common/tests/create-sdk"
import {
  APTOS_APT_CURRENCY,
  awaitAllUserItems,
  convertAptosToUnionAddress,
  convertAptosToUnionCollectionId,
} from "./common"

describe("Aptos Orders", () => {
  const sellerState = TestUtils.createTestAptosState(TestUtils.DEFAULT_PK)
  const sdkSeller = createSdk(sellerState, "testnet")
  const buyerState = TestUtils.createTestAptosState(TestUtils.BUYER_PK)
  const sdkBuyer = createSdk(buyerState, "testnet")
  const feeAddress = convertAptosToUnionAddress("0x6a98afd2d82f80f2dc535fac0a5d886281f9fe6a2b44a1511af70cdfa106ffe1")

  beforeAll(async () => {
    console.log("buyer", buyerState.account.accountAddress.toString())
    console.log("seller", sellerState.account.accountAddress.toString())
  })

  test.skip("token v1 sell & buy with CurrencyId with prepare", async () => {
    const randomAccountState = TestUtils.generateTestAptosState()
    const sdkRandomAccount = createSdk(randomAccountState, "testnet")
    await createV1TokenWithFeePayer(sellerState, randomAccountState)
    const items = await awaitAllUserItems(
      sdkRandomAccount,
      convertAptosToUnionAddress(randomAccountState.account.accountAddress.toString()),
    )

    const itemId = toItemId(items[0].id)
    const prepareResponse = await sdkRandomAccount.order.sell.prepare({ itemId })
    const sellOrder = await prepareResponse.submit({
      amount: 1,
      price: "0.002",
      currency: APTOS_APT_CURRENCY,
      expirationDate: generateExpirationDate(),
      originFees: [
        {
          value: 100,
          account: toUnionAddress("APTOS:0x4e6cac4deeffc70fd680b169882365beae7feab97bb488492a42c1b4308771bf"),
        },
      ],
    })
    await awaitOrder(sdkSeller, sellOrder)
    const buyPrepare = await sdkBuyer.order.buy.prepare({
      orderId: sellOrder,
    })
    expect(buyPrepare.orderData.nftCollection).toBeTruthy()
    const tx = await buyPrepare.submit({
      amount: 1,
    })
    await tx.wait()
  })

  test("sell & buy with CurrencyId with prepare", async () => {
    const { tokenAddress, collectionAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    await awaitCollection(sdkSeller, convertAptosToUnionCollectionId(collectionAddress))
    const prepareResponse = await sdkSeller.order.sell.prepare({
      itemId: toItemId(`APTOS:${tokenAddress}`),
    })
    const sellOrder = await prepareResponse.submit({
      amount: 1,
      price: "0.02",
      currency: APTOS_APT_CURRENCY,
      expirationDate: generateExpirationDate(),
      originFees: [
        {
          value: 100,
          account: toUnionAddress("APTOS:0x4e6cac4deeffc70fd680b169882365beae7feab97bb488492a42c1b4308771bf"),
        },
      ],
    })
    await awaitOrder(sdkSeller, sellOrder)
    const buyPrepare = await sdkBuyer.order.buy.prepare({
      orderId: sellOrder,
    })
    expect(buyPrepare.orderData.nftCollection).toBeTruthy()
    const tx = await buyPrepare.submit({
      amount: 1,
    })
    await tx.wait()
  })

  test("sell & buy with CurrencyId", async () => {
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
    await sdkBuyer.order.buy({
      orderId: sellOrder,
      amount: 1,
    })
  })

  test("sell & buy with Aptos asset type", async () => {
    const { tokenAddress, collectionAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    await awaitCollection(sdkSeller, convertAptosToUnionCollectionId(collectionAddress))
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
    const { tokenAddress, collectionAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    await awaitCollection(sdkSeller, convertAptosToUnionCollectionId(collectionAddress))
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
    const originFeeStartBalance = await sdkBuyer.balances.getBalance(feeAddress, APTOS_APT_CURRENCY)

    await awaitOrder(sdkSeller, sellOrder)
    await sdkBuyer.order.buy({
      orderId: sellOrder,
      amount: 1,
    })
    await awaitBalance(sdkSeller, feeAddress, APTOS_APT_CURRENCY, toBn("0.002").plus(originFeeStartBalance))
  })

  test("buy throws error when origin fees is passed", async () => {
    const { tokenAddress, collectionAddress } = await TestUtils.createTestCollectionAndMint(sellerState)
    await awaitCollection(sdkSeller, convertAptosToUnionCollectionId(collectionAddress))
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
