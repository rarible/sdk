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

  test("getFeeObject should return the same Schedule address", async () => {
    const feeScheduleAddress = "0x9db2c77084b1507acb9cb7d16350598b1e9db1cc61ecba1b017c467398d13f03"
    const sameFeeScheduleAddress = await sellerOrderClass.getFeeObject({ address: feeScheduleAddress, value: 0 })
    expect(sameFeeScheduleAddress).toEqual(feeScheduleAddress)
  })

  test("getFeeObject should return new FeeSchedule address with current fee receiver", async () => {
    const feeReceiver = "0x484e284d3b98ce736b6b6de27127176bafe30942d949f30b0ab59a17007ccf37"
    const feeScheduleAddress = await sellerOrderClass.getFeeObject({ address: feeReceiver, value: 100 })
    expect(feeScheduleAddress).not.toEqual(feeReceiver)
  })
})
