import type { Connection, PublicKey } from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { sendTransactionWithRetry } from "../../common/transactions"
import type { TransactionResult } from "../../types"
import type { DebugLogger } from "../../logger/debug-logger"
import { getAuctionHouseSellInstructions } from "./auction-house/sell"
import { getActionHouseBuyInstructions } from "./auction-house/buy"
import { getAuctionHouseExecuteSellInstructions } from "./auction-house/execute-sell"
import { getAuctionHouseCancelInstructions } from "./auction-house/cancel"

export interface ISellRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	price: number
	// tokens amount to sell
	tokensAmount: number
}

export type SellResponse = TransactionResult

export interface IBuyRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	tokenAccount?: PublicKey
	price: number
	// tokens amount to purchase
	tokensAmount: number
}

export type BuyResponse = TransactionResult

export interface ICancelRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	price: number
	tokensAmount: number
}

export type CancelResponse = TransactionResult

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

export type ExecuteSellResponse = TransactionResult

export interface ISolanaOrderSdk {
	sell(request: ISellRequest): Promise<SellResponse>
	buy(request: IBuyRequest): Promise<BuyResponse>
	cancel(request: ICancelRequest): Promise<CancelResponse>
	executeSell(request: IExecuteSellRequest): Promise<ExecuteSellResponse>
}

export class SolanaOrderSdk implements ISolanaOrderSdk {
	constructor(private readonly connection: Connection, private readonly logger: DebugLogger) {
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
			this.logger
		)

		this.logger.log(
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
			this.logger
		)

		this.logger.log("Made offer for ",
			request.mint.toString(),
			"for",
			request.price
		)

		return res
	}

	async cancel(request: ICancelRequest): Promise<CancelResponse> {
		const { instructions, signers } = await getAuctionHouseCancelInstructions({
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
			this.logger
		)

		this.logger.log("Cancelled order of",
			request.tokensAmount,
			request.mint.toString(),
			"for",
			request.price,
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
			this.logger
		)

		this.logger.log(
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
		// test method
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
			this.logger
		)

		return res
	}
}