import fs from "fs"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { Keypair, PublicKey } from "@solana/web3.js"
import { createSdk } from "./common"

describe.skip("eclipse nft sdk", () => {
  const sdk = createSdk()
  let signerAndOwner: SolanaKeypairWallet
  let nftMint: PublicKey

  beforeEach(() => {
    const keyfile = JSON.parse(fs.readFileSync(process.env.KEYPAIR_PATH!, "utf8"))
    const signerKeypair = Keypair.fromSecretKey(new Uint8Array(keyfile))
    signerAndOwner = SolanaKeypairWallet.fromKeypair(signerKeypair)
    nftMint = new PublicKey(process.env.NFT_ADDRESS!)
  })

  test("Should transfer nft", async () => {
    const amountToMint = 1
    const balance = await sdk.balances.getTokenBalance(signerAndOwner.publicKey, nftMint)
    expect(balance.eq(amountToMint)).toEqual(true)

    const wallet2 = new PublicKey("GZZvGELkzn19zMaPSGeMkcia3NXsPHakZs9nEkUvjZpV")
    const transferPrepare = await sdk.nft.transfer({
      signer: signerAndOwner,
      mint: nftMint,
      owner: signerAndOwner.publicKey,
      to: wallet2,
      amount: amountToMint,
    })

    const transferTx = await transferPrepare.submit("max")
    expect(transferTx).toBeTruthy()
    const txConfirm = await sdk.confirmTransaction(transferTx.txId, "finalized")
    expect(txConfirm).toBeTruthy()

    const wallet2Balance = await sdk.balances.getTokenBalance(wallet2, nftMint)
    expect(wallet2Balance.eq(amountToMint)).toEqual(true)

    const wallet1Balance = await sdk.balances.getTokenBalance(signerAndOwner.publicKey, nftMint)
    expect(wallet1Balance.eq(0)).toEqual(true)
  })

  test("Should burn nft", async () => {
    const burnPrepare = await sdk.nft.burn({
      signer: signerAndOwner,
      mint: nftMint,
      amount: 1,
      owner: signerAndOwner.publicKey,
    })

    const burnTx = await burnPrepare.submit("finalized")
    expect(burnTx).toBeTruthy()
    await sdk.confirmTransaction(burnTx.txId, "finalized")
    expect((await sdk.balances.getTokenBalance(signerAndOwner.publicKey, nftMint)).toString()).toEqual("0")
  })
})
