import { toPublicKey } from "@rarible/solana-common"
import { createSdk } from "./common"

describe("eclipse sdk balance", () => {
  const sdk = createSdk()

  test("Should check account balance", async () => {
    const balance = await sdk.balances.getBalance(toPublicKey("Fs2Rm7Y6yv1Fq26XL6WbFS2inBYhPyQY2XKZiitiySGf"))
    expect(parseFloat(balance.toString())).toBeGreaterThan(0)
  })

  test("Should check NFT balance", async () => {
    const mint = toPublicKey("8zbJYLV3BxosdK9F8HbVojc9PZjjPZY1aRBmNFbTUHo7")

    const balance = await sdk.balances.getTokenBalance(
      toPublicKey("GZZvGELkzn19zMaPSGeMkcia3NXsPHakZs9nEkUvjZpV"),
      mint,
    )
    expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
  })
})
