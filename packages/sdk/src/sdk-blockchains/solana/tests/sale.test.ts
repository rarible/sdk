import { toBigNumber, toItemId } from "@rarible/types"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"
import { createSdk } from "../common/test/create-sdk"
import { OriginFeeSupport } from "../../../types/order/fill/domain"

describe("Solana sell", () => {
  const wallet = getWallet(0)
  const buyerWallet = getWallet(1)
  const sdk = createSdk(wallet)
  const buyerSdk = createSdk(buyerWallet)

  test("Should sell NFT item", async () => {
    const item = await mintToken(sdk)
    const itemId = item.id

    const orderId = await retry(10, 4000, async () => {
      const sell = await sdk.order.sell.prepare({ itemId })
      return sell.submit({
        amount: 1,
        currency: {
          "@type": "SOLANA_SOL",
        },
        price: toBigNumber("0.001"),
      })
    })

    const tx = await retry(10, 4000, async () => {
      const buy = await buyerSdk.order.buy.prepare({
        orderId,
      })

      return buy.submit({
        amount: 1,
        itemId,
      })
    })

    expect(tx.hash()).toBeTruthy()
    await tx.wait()
  })

  test("Should sell NFT item with basic function", async () => {
    const item = await mintToken(sdk)
    const itemId = item.id

    const orderId = await retry(10, 4000, async () => {
      return sdk.order.sell({
        itemId,
        amount: 1,
        currency: {
          "@type": "SOLANA_SOL",
        },
        price: toBigNumber("0.001"),
      })
    })

    const tx = await retry(10, 4000, async () => {
      return buyerSdk.order.buy({
        orderId,
        amount: 1,
        itemId,
      })
    })

    expect(tx.hash()).toBeTruthy()
    await tx.wait()
  })

  test("get future order fees", async () => {
    const fees = await sdk.restriction.getFutureOrderFees(
      toItemId("SOLANA:Ev9n3xAfCrxPrUSUN4mLorwfaknjj4QMcyLUnbPymSmJ:1"),
    )
    expect(fees.originFeeSupport).toBe(OriginFeeSupport.NONE)
    expect(fees.baseFee).toBe(0)
  })
})
