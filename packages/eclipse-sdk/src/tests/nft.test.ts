import fs from "fs"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { Keypair, PublicKey } from "@solana/web3.js"
import { createSdk } from "./common"

describe.skip("eclipse nft sdk", () => {
  const sdk = createSdk()

  test(
    "Should transfer nft",
    async () => {
      const keyfile = JSON.parse(fs.readFileSync(process.env.KEYPAIR_PATH!, "utf8"))
      const signerKeypair = Keypair.fromSecretKey(new Uint8Array(keyfile))
      const signerAndOwner = SolanaKeypairWallet.fromKeypair(signerKeypair)

      const mint = new PublicKey("78MhrbjdHUsJ3XkmDyDdjgKpJPyCS5EDWC7qKdLAkZe2")
      const amountToMint = 1
      const balance = await sdk.balances.getTokenBalance(signerAndOwner.publicKey, mint)
      expect(balance.eq(amountToMint)).toEqual(true)

      const wallet2 = new PublicKey("GZZvGELkzn19zMaPSGeMkcia3NXsPHakZs9nEkUvjZpV")
      const transferPrepare = await sdk.nft.transfer({
        signer: signerAndOwner,
        mint,
        owner: signerAndOwner.publicKey,
        to: wallet2,
        amount: amountToMint,
      })

      const transferTx = await transferPrepare.submit("max")
      expect(transferTx).toBeTruthy()
      const txConfirm = await sdk.confirmTransaction(transferTx.txId, "finalized")
      expect(txConfirm).toBeTruthy()

      const wallet2Balance = await sdk.balances.getTokenBalance(wallet2, mint)
      expect(wallet2Balance.eq(amountToMint)).toEqual(true)

      const wallet1Balance = await sdk.balances.getTokenBalance(signerAndOwner.publicKey, mint)
      expect(wallet1Balance.eq(0)).toEqual(true)
    },
    1000 * 60 * 30,
  )

  test(
    "Should burn nft",
    async () => {
      const keyfile = JSON.parse(fs.readFileSync(process.env.KEYPAIR_PATH!, "utf8"))
      const signerKeypair = Keypair.fromSecretKey(new Uint8Array(keyfile))
      const signerAndOwner = SolanaKeypairWallet.fromKeypair(signerKeypair)

      const mint = new PublicKey("78MhrbjdHUsJ3XkmDyDdjgKpJPyCS5EDWC7qKdLAkZe2")

      const burnPrepare = await sdk.nft.burn({
        signer: signerAndOwner,
        mint: mint,
        amount: 1,
        owner: signerAndOwner.publicKey,
      })

      const burnTx = await burnPrepare.submit("finalized")
      expect(burnTx).toBeTruthy()
      await sdk.confirmTransaction(burnTx.txId, "finalized")
      expect((await sdk.balances.getTokenBalance(signerAndOwner.publicKey, mint)).toString()).toEqual("0")
    },
    1000 * 60 * 30,
  )
})
