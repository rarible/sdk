import { Account } from "@aptos-labs/ts-sdk"
import { createTestAptosState } from "./test"
import { AptosBalance } from "./balance"

describe("balance", () => {
  const { aptos } = createTestAptosState()

  const balanceInstance = new AptosBalance(aptos)

  test.skip("get balance", async () => {
    const randomAccount = Account.generate()
    await aptos.fundAccount({
      accountAddress: randomAccount.accountAddress,
      amount: 100_000_000,
    })
    const balance = await balanceInstance.getBalance(randomAccount.accountAddress)
    expect(balance).toBe("1")
  })
})
