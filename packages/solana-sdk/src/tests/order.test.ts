import { SolanaSdk } from "../sdk/sdk"
import { toPublicKey } from "../common/utils"
import { genTestWallet, getTestWallet, mint, requestSol } from "./common"

describe("solana order sdk", () => {
	const sdk = SolanaSdk.create({ connection: { cluster: "devnet" }, debug: true })

	test("Should sell & buy nft", async () => {
		const sellerWallet = getTestWallet()
		const auctionHouse = "8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm"
		const { mintTx } = await mint({ sdk, wallet: sellerWallet })

		const price = 0.01
		const tokenAmount = 1

		const { txId: sellTxId } = await sdk.order.sell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mintTx.mint,
		})
		expect(sellTxId).toBeTruthy()

		const buyerWallet = genTestWallet()
		await requestSol(sdk.connection, buyerWallet.publicKey, 0.1)

		const { txId: buyTxId } = await sdk.order.buy({
			auctionHouse: toPublicKey(auctionHouse),
			signer: buyerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mintTx.mint,
		})
		expect(buyTxId).toBeTruthy()

		console.log(JSON.stringify({
			auctionHouse,
			sellerWallet: sellerWallet.publicKey.toString(),
			buyerWallet: buyerWallet.publicKey.toString(),
			mint: mintTx.mint,
		}, null, " "))

		const { txId: finalTxId } = await sdk.order.executeSell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: buyerWallet,
			buyerWallet: buyerWallet.publicKey,
			sellerWallet: sellerWallet.publicKey,
			tokensAmount: tokenAmount,
			mint: mintTx.mint,
			price: price,
		})

		/*const { txId: finalTxId } = await (sdk.order as any).buyAndExecute({
			auctionHouse: toPublicKey(auctionHouse),
			signer: buyerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mintTx.mint,
			buyerWallet: buyerWallet.publicKey,
			sellerWallet: sellerWallet.publicKey,
		})*/
		expect(finalTxId).toBeTruthy()
	})

	test("Should make bid & sell nft", async () => {
		const sellerWallet = getTestWallet()
		const auctionHouse = "8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm"
		const { mintTx } = await mint({ sdk, wallet: sellerWallet })

		const price = 0.01
		const tokenAmount = 1

		const buyerWallet = genTestWallet()
		await requestSol(sdk.connection, buyerWallet.publicKey, 0.1)

		const { txId: buyTxId } = await sdk.order.buy({
			auctionHouse: toPublicKey(auctionHouse),
			signer: buyerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mintTx.mint,
		})
		expect(buyTxId).toBeTruthy()

		const { txId: sellTxId } = await sdk.order.sell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mintTx.mint,
		})
		expect(sellTxId).toBeTruthy()

		console.log(JSON.stringify({
			auctionHouse,
			sellerWallet: sellerWallet.publicKey.toString(),
			buyerWallet: buyerWallet.publicKey.toString(),
			mint: mintTx.mint,
		}, null, " "))

		const { txId: finalTxId } = await sdk.order.executeSell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			buyerWallet: buyerWallet.publicKey,
			sellerWallet: sellerWallet.publicKey,
			tokensAmount: tokenAmount,
			mint: mintTx.mint,
			price: price,
		})
		expect(finalTxId).toBeTruthy()
	})

	test("Should sell & cancel", async () => {
		const sellerWallet = getTestWallet()
		const auctionHouse = "8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm"
		const mint = toPublicKey("6APnUDJXkTAbT5tpKr3WeMGQ74p1QcXZjLR6erpnLM8P")

		const price = 0.01
		const tokenAmount = 1

		const { txId: sellTxId } = await sdk.order.sell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})
		expect(sellTxId).toBeTruthy()

		const { txId } = await sdk.order.cancel({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})
		expect(txId).toBeTruthy()
	})

	test("Should buy & cancel", async () => {
		const sellerWallet = getTestWallet()
		const auctionHouse = "8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm"
		const mint = toPublicKey("6APnUDJXkTAbT5tpKr3WeMGQ74p1QcXZjLR6erpnLM8P")

		const price = 0.01
		const tokenAmount = 1

		const { txId: sellTxId } = await sdk.order.sell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})
		expect(sellTxId).toBeTruthy()

		const { txId } = await sdk.order.cancel({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})
		expect(txId).toBeTruthy()
	})
})