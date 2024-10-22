import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { createSdk, getTestWallet, mintToken } from "./common"

// @todo: both tests having the same error:
//
// SolanaJSONRPCError: failed to get token accounts owned by account
// 2XyukL1KvwDkfNcdBpfXbj6UtPqF7zcUdTDURNjLFAMo: Invalid param: could not find mint

describe.skip("solana nft sdk", () => {
  const sdk = createSdk()

  test(
    "Should mint nft & send",
    async () => {
      const wallet1 = getTestWallet()
      const { mint } = await mintToken({ sdk, wallet: wallet1 })
      const amountToMint = 1
      const balance = await sdk.balances.getTokenBalance(wallet1.publicKey, mint)
      expect(balance.eq(amountToMint)).toEqual(true)

      const wallet2 = SolanaKeypairWallet.fromSeed(undefined)
      const transferPrepare = await sdk.nft.transfer({
        signer: wallet1,
        mint,
        to: wallet2.publicKey,
        amount: amountToMint,
      })

      const transferTx = await transferPrepare.submit("max")
      expect(transferTx).toBeTruthy()
      const txConfirm = await sdk.confirmTransaction(transferTx.txId, "finalized")
      expect(txConfirm).toBeTruthy()

      const wallet2Balance = await sdk.balances.getTokenBalance(wallet2.publicKey, mint)
      expect(wallet2Balance.eq(amountToMint)).toEqual(true)

      const wallet1Balance = await sdk.balances.getTokenBalance(wallet1.publicKey, mint)
      expect(wallet1Balance.eq(0)).toEqual(true)
    },
    1000 * 60 * 30,
  )

  test(
    "Should mint nft & burn",
    async () => {
      const wallet = getTestWallet()

      const { mint } = await mintToken({ sdk, wallet })

      const burnPrepare = await sdk.nft.burn({
        signer: wallet,
        mint: mint,
        amount: 1,
      })
      const burnTx = await burnPrepare.submit("finalized")
      expect(burnTx).toBeTruthy()
      await sdk.confirmTransaction(burnTx.txId, "finalized")
      expect((await sdk.balances.getTokenBalance(wallet.publicKey, mint)).toString()).toEqual("0")
    },
    1000 * 60 * 30,
  )
})
