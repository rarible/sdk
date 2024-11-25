import fs from "fs"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { Keypair, PublicKey } from "@solana/web3.js"
import { BigNumber } from "@rarible/utils"
import { ECLIPSE_NATIVE_CURRENCY_ADDRESS } from "../common/params"
import { createSdk } from "./common"

const marketIdentifier = new PublicKey("ASSySjiXf9T8Mp6Qw7bKgymahRDzyroamBTTER3BaBHm")

describe.skip("eclipse order sdk", () => {
  const sdk = createSdk()

  test(
    "Should return marketplace",
    async () => {
      const marketPlace = await sdk.order.getMarketPlace({ marketIdentifier })
      expect(marketPlace).toBeTruthy()
      expect(marketPlace.feeBps).toEqual(1000)
      expect(marketPlace.feeRecipient).toEqual("Fs2Rm7Y6yv1Fq26XL6WbFS2inBYhPyQY2XKZiitiySGf")
    },
    1000 * 60 * 30,
  )

  function getSignerAndOwner() {
    const keyfile = JSON.parse(fs.readFileSync(process.env.KEYPAIR_PATH!, "utf8"))
    const signerKeypair = Keypair.fromSecretKey(new Uint8Array(keyfile))
    return SolanaKeypairWallet.fromKeypair(signerKeypair)
  }

  async function createSellOrder(mint: PublicKey) {
    const signerAndOwner = getSignerAndOwner()

    const amount = 1
    const balance = await sdk.balances.getTokenBalance(signerAndOwner.publicKey, mint)
    expect(balance.eq(amount)).toEqual(true)

    const sellPrepare = await sdk.order.sell({
      signer: signerAndOwner,
      nftMint: mint,
      paymentMint: new PublicKey(ECLIPSE_NATIVE_CURRENCY_ADDRESS),
      price: new BigNumber(1),
      tokensAmount: amount,
      marketIdentifier,
    })

    const sellTx = await sellPrepare.submit("max")
    expect(sellTx).toBeTruthy()
    const txConfirm = await sdk.confirmTransaction(sellTx.txId, "finalized")
    expect(txConfirm).toBeTruthy()

    return sellTx
  }

  test(
    "Should create sell order",
    async () => {
      await createSellOrder(new PublicKey("CzmMhzr23NzUBe1Ai2VxBEPhC7gNJzZiBPCB2UWGJfSE"))
    },
    1000 * 60 * 30,
  )

  test(
    "Should cancel sell order",
    async () => {
      const mint = new PublicKey("CzmMhzr23NzUBe1Ai2VxBEPhC7gNJzZiBPCB2UWGJfSE")
      const result = await createSellOrder(mint)
      const signerAndOwner = getSignerAndOwner()

      const cancelPrepare = await sdk.order.cancel({
        signer: signerAndOwner,
        orderAddress: result.orderId!,
      })

      const cancelTx = await cancelPrepare.submit("max")
      expect(cancelTx).toBeTruthy()
      const txConfirm = await sdk.confirmTransaction(cancelTx.txId, "finalized")
      expect(txConfirm).toBeTruthy()
    },
    1000 * 60 * 30,
  )

  test(
    "Should execute sell order",
    async () => {
      const mint = new PublicKey("CzmMhzr23NzUBe1Ai2VxBEPhC7gNJzZiBPCB2UWGJfSE")
      const result = await createSellOrder(mint)
      const signerAndOwner = getSignerAndOwner()
      const buyPrepare = await sdk.order.executeOrder({
        signer: signerAndOwner,
        nftMint: mint,
        orderAddress: result.orderId!,
        amountToFill: 1,
      })

      const buyTx = await buyPrepare.submit("max")
      expect(buyTx).toBeTruthy()
      const buyTxConfirm = await sdk.confirmTransaction(result.txId, "finalized")
      expect(buyTxConfirm).toBeTruthy()
    },
    1000 * 60 * 30,
  )

  test(
    "Should create bid",
    async () => {
      const mint = new PublicKey("CzmMhzr23NzUBe1Ai2VxBEPhC7gNJzZiBPCB2UWGJfSE")

      const signerAndOwner = getSignerAndOwner()
      const prepare = await sdk.order.bid({
        signer: signerAndOwner,
        nftMint: mint,
        paymentMint: new PublicKey(ECLIPSE_NATIVE_CURRENCY_ADDRESS),
        marketIdentifier,
        price: new BigNumber(1),
        tokensAmount: 1,
      })

      const trx = await prepare.submit("max")
      expect(trx).toBeTruthy()
      const buyTxConfirm = await sdk.confirmTransaction(trx.txId, "finalized")
      expect(buyTxConfirm).toBeTruthy()
    },
    1000 * 60 * 30,
  )

  test(
    "Should accept bid",
    async () => {
      const mint = new PublicKey("CzmMhzr23NzUBe1Ai2VxBEPhC7gNJzZiBPCB2UWGJfSE")
      const orderAddress = new PublicKey("3gcMfJgEeQH7tjohfg75n3WuTT9wajMp4WySZSQeFEeY")

      const signerAndOwner = getSignerAndOwner()

      const prepare = await sdk.order.executeOrder({
        signer: signerAndOwner,
        nftMint: mint,
        orderAddress,
        amountToFill: 1,
      })

      const trx = await prepare.submit("max")
      expect(trx).toBeTruthy()
      const confirm = await sdk.confirmTransaction(trx.txId, "finalized")
      expect(confirm).toBeTruthy()
    },
    1000 * 60 * 30,
  )
})
