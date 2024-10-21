import { createTestAptosState, createTestCollectionAndMint } from "../common/test"
import { AptosOrder } from "./index"

describe("bid nft", () => {
  const sellerState = createTestAptosState()
  const buyerState = createTestAptosState()
  const sellerOrderClass = new AptosOrder(sellerState.aptos, sellerState.wallet, sellerState.config)
  const buyerOrderClass = new AptosOrder(buyerState.aptos, buyerState.wallet, buyerState.config)
  const feeAddress = sellerState.config.feeZeroScheduleAddress

  test("create collection offer", async () => {
    const price = "2000000"
    const { collectionAddress } = await createTestCollectionAndMint(sellerState)

    const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 60

    const amount = 1
    const tx = await sellerOrderClass.collectionOffer(collectionAddress, amount, feeAddress, expirationTime, price)
    expect(tx).toBeTruthy()
  })

  test("cancel collection offer", async () => {
    const price = "2000000"
    const { collectionAddress } = await createTestCollectionAndMint(sellerState)

    const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 60

    const amount = 1
    const offer = await sellerOrderClass.collectionOffer(collectionAddress, amount, feeAddress, expirationTime, price)
    expect(offer).toBeTruthy()

    const tx = await sellerOrderClass.cancelCollectionOffer(offer)
    expect(tx.hash).toBeTruthy()
  })

  test("accept collection offer", async () => {
    const price = "2000000"
    const { collectionAddress, tokenAddress } = await createTestCollectionAndMint(sellerState)

    const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 60

    const amount = 1
    const offer = await buyerOrderClass.collectionOffer(collectionAddress, amount, feeAddress, expirationTime, price)
    expect(offer).toBeTruthy()

    const tx = await sellerOrderClass.acceptCollectionOffer(offer, tokenAddress)
    expect(tx.hash).toBeTruthy()
  })

  test("create item offer", async () => {
    const feeAddress = sellerState.config.feeZeroScheduleAddress

    const price = "2000000"
    const { tokenAddress } = await createTestCollectionAndMint(sellerState)

    const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 60

    const tokenOffer = await sellerOrderClass.tokenOffer(tokenAddress, feeAddress, expirationTime, price)
    expect(tokenOffer).toBeTruthy()
  })

  test("cancel item offer", async () => {
    const price = "2000000"
    const { tokenAddress } = await createTestCollectionAndMint(sellerState)

    const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 60

    const tokenOffer = await sellerOrderClass.tokenOffer(tokenAddress, feeAddress, expirationTime, price)
    expect(tokenOffer).toBeTruthy()
    const cancelTx = await sellerOrderClass.cancelTokenOffer(tokenOffer)
    expect(cancelTx).toBeTruthy()
  })

  test("accept item offer", async () => {
    const price = "2000000"
    const { tokenAddress } = await createTestCollectionAndMint(sellerState)

    const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 60

    const offer = await buyerOrderClass.tokenOffer(tokenAddress, feeAddress, expirationTime, price)
    expect(offer).toBeTruthy()

    const tx = await sellerOrderClass.acceptTokenOffer(offer)
    expect(tx.hash).toBeTruthy()
  })
})
