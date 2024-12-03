import fs from "fs"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { Keypair, PublicKey } from "@solana/web3.js"
import { BigNumber } from "@rarible/utils"
import { ECLIPSE_NATIVE_CURRENCY_ADDRESS } from "../common/params"
import { createSdk } from "./common"

const marketIdentifier = new PublicKey("ASSySjiXf9T8Mp6Qw7bKgymahRDzyroamBTTER3BaBHm")

describe("eclipse order sdk", () => {
  const sdk = createSdk()
  let signerAndOwner: SolanaKeypairWallet
  let nftMint: PublicKey

  beforeEach(() => {
    const keyfile = JSON.parse(fs.readFileSync(process.env.KEYPAIR_PATH!, "utf8"))
    const signerKeypair = Keypair.fromSecretKey(new Uint8Array(keyfile))
    signerAndOwner = SolanaKeypairWallet.fromKeypair(signerKeypair)
    nftMint = new PublicKey(process.env.NFT_ADDRESS!)
  })

  test.skip(
    "Should return marketplace",
    async () => {
      const marketPlace = await sdk.order.getMarketPlace({ marketIdentifier })
      expect(marketPlace).toBeTruthy()
      expect(marketPlace.feeBps.toNumber()).toEqual(1000)
      expect(marketPlace.feeRecipient.toString()).toEqual("Fs2Rm7Y6yv1Fq26XL6WbFS2inBYhPyQY2XKZiitiySGf")
    },
    1000 * 60 * 30,
  )

  async function createSellOrder(mint: PublicKey) {
    const amount = 1
    const balance = await sdk.balances.getTokenBalance(signerAndOwner.publicKey, mint)
    expect(balance.eq(amount)).toEqual(true)

    const sellPrepare = await sdk.order.sell({
      signer: signerAndOwner,
      nftMint: mint,
      paymentMint: new PublicKey(ECLIPSE_NATIVE_CURRENCY_ADDRESS),
      price: new BigNumber(0.00001),
      tokensAmount: amount,
      marketIdentifier,
    })

    const sellTx = await sellPrepare.submit("max")
    expect(sellTx).toBeTruthy()
    const txConfirm = await sdk.confirmTransaction(sellTx.txId, "finalized")
    expect(txConfirm).toBeTruthy()

    return sellTx
  }

  test.skip("Should create sell order", async () => {
    await createSellOrder(nftMint)
  })

  test.skip("Should cancel sell order", async () => {
    const result = await createSellOrder(nftMint)

    const cancelPrepare = await sdk.order.cancel({
      signer: signerAndOwner,
      orderAddress: result.orderId!,
    })

    const cancelTx = await cancelPrepare.submit("max")
    expect(cancelTx).toBeTruthy()
    const txConfirm = await sdk.confirmTransaction(cancelTx.txId, "finalized")
    expect(txConfirm).toBeTruthy()
  })

  test.skip("Should execute sell order", async () => {
    const result = await createSellOrder(nftMint)
    const buyPrepare = await sdk.order.executeOrder({
      signer: signerAndOwner,
      nftMint: nftMint,
      orderAddress: result.orderId!,
      amountToFill: 1,
    })

    const buyTx = await buyPrepare.submit("max")
    expect(buyTx).toBeTruthy()
    const buyTxConfirm = await sdk.confirmTransaction(result.txId, "finalized")
    expect(buyTxConfirm).toBeTruthy()
  })

  test.skip("Should create bid", async () => {
    const prepare = await sdk.order.bid({
      signer: signerAndOwner,
      nftMint,
      paymentMint: new PublicKey(ECLIPSE_NATIVE_CURRENCY_ADDRESS),
      marketIdentifier,
      price: new BigNumber(0.00001),
      tokensAmount: 1,
    })

    const trx = await prepare.submit("max")
    expect(trx).toBeTruthy()
    const txConfirm = await sdk.confirmTransaction(trx.txId, "finalized")
    expect(txConfirm).toBeTruthy()
  })

  test.skip("Should accept bid", async () => {
    const bidPrepare = await sdk.order.bid({
      signer: signerAndOwner,
      nftMint,
      paymentMint: new PublicKey(ECLIPSE_NATIVE_CURRENCY_ADDRESS),
      marketIdentifier,
      price: new BigNumber(0.00001),
      tokensAmount: 1,
    })

    const bidTrx = await bidPrepare.submit("max")
    expect(bidTrx).toBeTruthy()
    const txConfirm = await sdk.confirmTransaction(bidTrx.txId, "finalized")
    expect(txConfirm).toBeTruthy()

    const acceptBidPrepare = await sdk.order.executeOrder({
      signer: signerAndOwner,
      nftMint,
      orderAddress: bidTrx.orderId!,
      amountToFill: 1,
    })

    const trx = await acceptBidPrepare.submit("max")
    expect(trx).toBeTruthy()
    const confirm = await sdk.confirmTransaction(trx.txId, "finalized")
    expect(confirm).toBeTruthy()
  })
})
