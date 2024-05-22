import { getSolanaMockWallet, solanaKeyKinds } from "@rarible/solana-common/build/tests/wallets"
import { SolanaKeypairWallet } from "../wallet/keypair-wallet"

describe("solana wallet", () => {
  test("should generate random keypair", () => {
    const wallet = SolanaKeypairWallet.fromSeed(undefined)
    expect(wallet.keyPair.secretKey).toBeTruthy()
  })

  test.each(solanaKeyKinds)("Should create wallet from %s", key => {
    const walletMock = getSolanaMockWallet(0)
    const wallet = SolanaKeypairWallet.fromKey(walletMock.keys[key])

    expect(wallet.keyPair.secretKey).toEqual(walletMock.keys.arrayPrivateKey)
    expect(wallet.keyPair.publicKey.toBase58()).toEqual(walletMock.publicKeyString)
  })

  test.each(solanaKeyKinds)("Should sign message with %s", async key => {
    const walletMock = getSolanaMockWallet(0)
    const signatureWord = "test" as const
    const wallet = SolanaKeypairWallet.fromKey(walletMock.keys[key])
    const result = await wallet.signMessage(signatureWord)
    expect(result.publicKey.toString()).toEqual(walletMock.publicKeyString)
    expect(result.signature).toEqual(walletMock.signatures[signatureWord].array)
  })
})
