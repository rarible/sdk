import { createTestAptosState, mintTestToken } from "../common/test"
import { AptosOrder } from "./index"

describe("sell nft", () => {
  const sellerState = createTestAptosState("0xfce8feeb54fbdbd4c563613d6c06396d19710d82bd5668ff66b47a3cd04dff54")
  const buyerState = createTestAptosState()
  const sellerOrderClass = new AptosOrder(sellerState.aptos, sellerState.wallet, sellerState.config)
  const buyerOrderClass = new AptosOrder(buyerState.aptos, buyerState.wallet, buyerState.config)
  const feeAddress = sellerState.config.feeZeroScheduleAddress

  test("sell", async () => {
    const { tokenAddress } = await mintTestToken(sellerState)

    const feeAddress = sellerState.config.feeZeroScheduleAddress
    const startTime = Math.floor(Date.now() / 1000) + 10
    const price = "2000000"

    const tx = await sellerOrderClass.sell(tokenAddress, feeAddress, startTime, price)
    expect(tx).toBeTruthy()
  })

  test("cancel sell order", async () => {
    const { tokenAddress } = await mintTestToken(sellerState)

    const startTime = Math.floor(Date.now() / 1000)
    const price = "2000000"

    const orderId = await sellerOrderClass.sell(tokenAddress, feeAddress, startTime, price)
    const tx = await sellerOrderClass.cancel(orderId)
    expect(tx).toBeTruthy()
  })

  test("buy sell order", async () => {
    const { tokenAddress } = await mintTestToken(sellerState)

    const startTime = Math.floor(Date.now() / 1000)
    const price = "2000000"

    const orderId = await sellerOrderClass.sell(tokenAddress, feeAddress, startTime, price)

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
