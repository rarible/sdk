import * as entities from "./index"

describe("exports", () => {
  test("exports should return certain entities", () => {
    expect(Object.keys(entities)).toMatchInlineSnapshot(`
      [
        "WalletType",
        "EthereumWallet",
        "AptosWallet",
        "ImmutableXWallet",
        "SolanaWallet",
        "TezosWallet",
        "FlowWallet",
        "isBlockchainWallet",
      ]
    `)
  })
})
