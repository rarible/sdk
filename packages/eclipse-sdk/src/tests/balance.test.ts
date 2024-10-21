import { toPublicKey } from "@rarible/solana-common"
import { createSdk } from "./common"

describe("eclipse sdk balance", () => {
  const sdk = createSdk()

  test("Should check account balance", async () => {
    const balance = await sdk.balances.getBalance(toPublicKey("GZZvGELkzn19zMaPSGeMkcia3NXsPHakZs9nEkUvjZpV"))
    expect(parseFloat(balance.toString())).toBeGreaterThan(0)
  })

  test.skip("Should check NFT balance", async () => {
    const mint = toPublicKey("6APnUDJXkTAbT5tpKr3WeMGQ74p1QcXZjLR6erpnLM8P")

    const balance = await sdk.balances.getTokenBalance(
      toPublicKey("GZZvGELkzn19zMaPSGeMkcia3NXsPHakZs9nEkUvjZpV"),
      mint,
    )
    expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
  })
})
