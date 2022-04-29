import { toPublicKey } from "@rarible/solana-common"
import { SolanaSdk } from "../sdk/sdk"
import { genTestWallet, getTestWallet, mintToken, requestSol } from "./common"

describe("solana order sdk", () => {
	const sdk = SolanaSdk.create({ connection: { cluster: "devnet" }, debug: true })

	test("Should sell & buy nft", async () => {
		const sellerWallet = getTestWallet()
		const auctionHouse = "8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm"
		const { mint } = await mintToken({ sdk, wallet: sellerWallet })

		const price = 0.01
		const tokenAmount = 1

		const { txId: sellTxId } = await (await sdk.order.sell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})).submit("max")
		expect(sellTxId).toBeTruthy()

		const buyerWallet = genTestWallet()
		await requestSol(sdk.connection, buyerWallet.publicKey, 0.1)

		const { txId: buyTxId } = await (await sdk.order.buy({
			auctionHouse: toPublicKey(auctionHouse),
			signer: buyerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})).submit("max")
		expect(buyTxId).toBeTruthy()

		console.log(JSON.stringify({
			auctionHouse,
			sellerWallet: sellerWallet.publicKey.toString(),
			buyerWallet: buyerWallet.publicKey.toString(),
			mint: mint,
		}, null, " "))

		const { txId: finalTxId } = await (await sdk.order.executeSell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: buyerWallet,
			buyerWallet: buyerWallet.publicKey,
			sellerWallet: sellerWallet.publicKey,
			tokensAmount: tokenAmount,
			mint: mint,
			price: price,
		})).submit("max")

		expect(finalTxId).toBeTruthy()
	})


	test("Should buy & execute sell in one call", async () => {
		const sellerWallet = getTestWallet()
		const auctionHouse = "8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm"
		const { mint } = await mintToken({ sdk, wallet: sellerWallet })

		const price = 0.01
		const tokenAmount = 1

		const { txId: sellTxId } = await (await sdk.order.sell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})).submit("max")
		expect(sellTxId).toBeTruthy()

		const buyerWallet = genTestWallet()
		await requestSol(sdk.connection, buyerWallet.publicKey, 0.1)

		const buyPrepare = await sdk.order.buy({
			auctionHouse: toPublicKey(auctionHouse),
			signer: buyerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})

		const executeSellPrepare = await sdk.order.executeSell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: buyerWallet,
			buyerWallet: buyerWallet.publicKey,
			sellerWallet: sellerWallet.publicKey,
			tokensAmount: tokenAmount,
			mint: mint,
			price: price,
		})

		const finalTx = await sdk.unionInstructionsAndSend(
			buyerWallet,
			[buyPrepare, executeSellPrepare],
			"max"
		)

		expect(finalTx.txId).toBeTruthy()
	})

	test("Should make bid & sell nft", async () => {
		const sellerWallet = getTestWallet()
		const auctionHouse = "8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm"
		const { mint } = await mintToken({ sdk, wallet: sellerWallet })

		const price = 0.01
		const tokenAmount = 1

		const buyerWallet = genTestWallet()
		await requestSol(sdk.connection, buyerWallet.publicKey, 0.1)

		const { txId: buyTxId } = await (await sdk.order.buy({
			auctionHouse: toPublicKey(auctionHouse),
			signer: buyerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})).submit("max")
		expect(buyTxId).toBeTruthy()

		const { txId: sellTxId } = await (await sdk.order.sell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})).submit("max")
		expect(sellTxId).toBeTruthy()

		console.log(JSON.stringify({
			auctionHouse,
			sellerWallet: sellerWallet.publicKey.toString(),
			buyerWallet: buyerWallet.publicKey.toString(),
			mint: mint,
		}, null, " "))

		const { txId: finalTxId } = await (await sdk.order.executeSell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			buyerWallet: buyerWallet.publicKey,
			sellerWallet: sellerWallet.publicKey,
			tokensAmount: tokenAmount,
			mint: mint,
			price: price,
		})).submit("max")
		expect(finalTxId).toBeTruthy()
	})

	test("Should sell & cancel", async () => {
		const sellerWallet = getTestWallet()
		const auctionHouse = "8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm"
		const mint = toPublicKey("6APnUDJXkTAbT5tpKr3WeMGQ74p1QcXZjLR6erpnLM8P")

		const price = 0.01
		const tokenAmount = 1

		const { txId: sellTxId } = await (await sdk.order.sell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})).submit("max")
		expect(sellTxId).toBeTruthy()

		const { txId } = await (await sdk.order.cancel({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})).submit("max")
		expect(txId).toBeTruthy()
	})

	test("Should buy & cancel", async () => {
		const sellerWallet = getTestWallet()
		const auctionHouse = "8Qu3azqi31VpgPwVW99AyiBGnLSpookWQiwLMvFn4NFm"
		const mint = toPublicKey("6APnUDJXkTAbT5tpKr3WeMGQ74p1QcXZjLR6erpnLM8P")

		const price = 0.01
		const tokenAmount = 1

		const { txId: sellTxId } = await (await sdk.order.sell({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})).submit("max")
		expect(sellTxId).toBeTruthy()

		const { txId } = await (await sdk.order.cancel({
			auctionHouse: toPublicKey(auctionHouse),
			signer: sellerWallet,
			price: price,
			tokensAmount: tokenAmount,
			mint: mint,
		})).submit("max")
		expect(txId).toBeTruthy()
	})
})