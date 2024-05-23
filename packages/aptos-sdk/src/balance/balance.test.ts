import { createTestAptosState } from "../common/test"
import { AptosBalance } from "./balance"

describe("balance test", () => {
  const { aptos } = createTestAptosState()
  const balances = new AptosBalance(aptos)

  test("get balance collection", async () => {
    const balance = await balances.getAptosBalance({
      address: "0x484e284d3b98ce736b6b6de27127176bafe30942d949f30b0ab59a17007ccf37",
    })
    expect(balance).toBeTruthy()
  })
})
