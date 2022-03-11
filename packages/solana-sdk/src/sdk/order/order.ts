import type { Connection, PublicKey } from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { sendTransactionWithRetry } from "../../common/transactions"
import { getAuctionHouseSellInstructions } from "./auction-house/sell"
import { getActionHouseBuyInstructions } from "./auction-house/buy"
import { getAuctionHouseExecuteSellInstructions } from "./auction-house/execute-sell"

export interface ISellRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	price: number
	// tokens amount to sell
	tokensAmount: number
}

// eslint-disable-next-line no-undef
export type SellResponse = Awaited<ReturnType<typeof sendTransactionWithRetry>>

export interface IBuyRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	tokenAccount?: PublicKey
	price: number
	// tokens amount to purchase
	tokensAmount: number
}

// eslint-disable-next-line no-undef
export type BuyResponse = Awaited<ReturnType<typeof sendTransactionWithRetry>>

export interface IExecuteSellRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	buyerWallet: PublicKey
	sellerWallet: PublicKey
	mint: PublicKey
	tokenAccount?: PublicKey
	price: number
	// tokens amount to purchase
	tokensAmount: number
}

// eslint-disable-next-line no-undef
export type ExecuteSellResponse = Awaited<ReturnType<typeof sendTransactionWithRetry>>

export interface ISolanaOrderSdk {
	sell(request: ISellRequest): Promise<SellResponse>
	buy(request: IBuyRequest): Promise<BuyResponse>
	executeSell(request: IExecuteSellRequest): Promise<ExecuteSellResponse>
}

export class SolanaOrderSdk implements ISolanaOrderSdk {
	constructor(private readonly connection: Connection) {
	}

	async sell(request: ISellRequest): Promise<SellResponse> {

		const { instructions, signers } = await getAuctionHouseSellInstructions({
			connection: this.connection,
			auctionHouse: request.auctionHouse,
			price: request.price,
			mint: request.mint,
			signer: request.signer,
			tokensAmount: request.tokensAmount,
		})

		const res = await sendTransactionWithRetry(
			this.connection,
			request.signer,
			instructions,
			signers,
			"max",
		)

		console.log(
			"Set",
			request.tokensAmount,
			request.mint.toString(),
			"for sale for",
			request.price,
			"from your account with Auction House",
			request.auctionHouse.toString(),
		)

		return res
	}

	async buy(request: IBuyRequest): Promise<BuyResponse> {
		const { instructions, signers } = await getActionHouseBuyInstructions({
			connection: this.connection,
			auctionHouse: request.auctionHouse,
			price: request.price,
			mint: request.mint,
			signer: request.signer,
			tokensAmount: request.tokensAmount,
			tokenAccount: request.tokenAccount,
		})

		const res = await sendTransactionWithRetry(
			this.connection,
			request.signer,
			instructions,
			signers,
			"max",
		)

		console.log("Made offer for ",
			request.mint.toString(),
			"for",
			request.price
		)

		return res
	}

	async acceptBid(request: ISellRequest): Promise<SellResponse> {
		return this.sell(request)
	}

	async bid(request: IBuyRequest): Promise<BuyResponse> {
		return this.buy(request)
	}

	async executeSell(request: IExecuteSellRequest): Promise<ExecuteSellResponse> {
		const { instructions, signers } = await getAuctionHouseExecuteSellInstructions({
			connection: this.connection,
			auctionHouse: request.auctionHouse,
			signer: request.signer,
			buyerWallet: request.buyerWallet,
			sellerWallet: request.sellerWallet,
			mint: request.mint,
			tokenAccount: request.tokenAccount,
			price: request.price,
			tokensAmount: request.tokensAmount,
		})

		const res = await sendTransactionWithRetry(
			this.connection,
			request.signer,
			instructions,
			signers,
			"max",
		)

		console.log(
			"Accepted",
			request.tokensAmount,
			request.mint.toString(),
			"sale from wallet",
			request.sellerWallet.toString(),
			"to",
			request.buyerWallet.toString(),
			"for",
			request.price,
			"from your account with Auction House",
			request.auctionHouse.toString(),
		)

		return res
	}

	async buyAndExecute(request: IExecuteSellRequest & IBuyRequest): Promise<ExecuteSellResponse> {
		const { instructions: buyInstructions, signers: buySigners } = await getActionHouseBuyInstructions({
			connection: this.connection,
			auctionHouse: request.auctionHouse,
			price: request.price,
			mint: request.mint,
			signer: request.signer,
			tokensAmount: request.tokensAmount,
			tokenAccount: request.tokenAccount,
		})

		const { instructions: execInstructions, signers: execSigners } = await getAuctionHouseExecuteSellInstructions({
			connection: this.connection,
			auctionHouse: request.auctionHouse,
			signer: request.signer,
			buyerWallet: request.buyerWallet,
			sellerWallet: request.sellerWallet,
			mint: request.mint,
			tokenAccount: request.tokenAccount,
			price: request.price,
			tokensAmount: request.tokensAmount,
		})

		const res = await sendTransactionWithRetry(
			this.connection,
			request.signer,
			[...buyInstructions, ...execInstructions],
			[...buySigners, ...execSigners],
			"max",
		)

		return res
	}
}