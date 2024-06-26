import { createTestAptosState, mintTestToken } from "../common/test"
import { AptosOrder } from "./index"

describe("sell nft", () => {
  const sellerState = createTestAptosState()
  const buyerState = createTestAptosState()
  const sellerOrderClass = new AptosOrder(sellerState.aptos, sellerState.wallet, sellerState.config)
  const buyerOrderClass = new AptosOrder(buyerState.aptos, buyerState.wallet, buyerState.config)
  const feeAddress = sellerState.config.feeZeroScheduleAddress

  test("sell", async () => {
    const testTokenAddress = await mintTestToken(sellerState)

    const feeAddress = sellerState.config.feeZeroScheduleAddress
    const startTime = Math.floor(Date.now() / 1000) + 10
    const price = "2000000"

    const tx = await sellerOrderClass.sell(testTokenAddress, feeAddress, startTime, price)
    expect(tx).toBeTruthy()
  })

  test("cancel sell order", async () => {
    const testTokenAddress = await mintTestToken(sellerState)

    const startTime = Math.floor(Date.now() / 1000)
    const price = "2000000"

    const orderId = await sellerOrderClass.sell(testTokenAddress, feeAddress, startTime, price)
    const tx = await sellerOrderClass.cancel(orderId)
    expect(tx).toBeTruthy()
  })

  test("buy sell order", async () => {
    const testTokenAddress = await mintTestToken(sellerState)

    const startTime = Math.floor(Date.now() / 1000)
    const price = "2000000"

    const orderId = await sellerOrderClass.sell(testTokenAddress, feeAddress, startTime, price)

    const tx = await buyerOrderClass.buy(orderId)
    expect(tx).toBeTruthy()
  })

  test("create fee schedule", async () => {
    const feeAddress = await sellerOrderClass.createFeeSchedule({
      value: 0,
    })
    expect(feeAddress).toBeTruthy()
    expect(typeof feeAddress === "string").toBeTruthy()
  })
})
