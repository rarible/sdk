import type { Connection, PublicKey } from "@solana/web3.js"
import type { BigNumberValue } from "@rarible/utils"
import type { IWalletSigner } from "@rarible/solana-wallet"
import type { DebugLogger } from "../../logger/debug-logger"
import { PreparedTransaction } from "../prepared-transaction"
import { getAuctionHouseSellInstructions } from "./methods/sell"
import { getActionHouseBuyInstructions } from "./methods/buy"
import { getAuctionHouseExecuteSellInstructions } from "./methods/execute-sell"
import { getAuctionHouseCancelInstructions } from "./methods/cancel"

export interface ISellRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	price: BigNumberValue
	// tokens amount to sell
	tokensAmount: BigNumberValue
}

export interface IBuyRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	tokenAccount?: PublicKey
	price: BigNumberValue
	// tokens amount to purchase
	tokensAmount: BigNumberValue
}

export interface ICancelRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	price: BigNumberValue
	tokensAmount: BigNumberValue
}

export interface IExecuteSellRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	buyerWallet: PublicKey
	sellerWallet: PublicKey
	mint: PublicKey
	tokenAccount?: PublicKey
	price: BigNumberValue
	// tokens amount to purchase
	tokensAmount: BigNumberValue
}

export interface ISolanaOrderSdk {
	sell(request: ISellRequest): Promise<PreparedTransaction>
	buy(request: IBuyRequest): Promise<PreparedTransaction>
	cancel(request: ICancelRequest): Promise<PreparedTransaction>
	executeSell(request: IExecuteSellRequest): Promise<PreparedTransaction>
}

export class SolanaOrderSdk implements ISolanaOrderSdk {
	constructor(private readonly connection: Connection, private readonly logger: DebugLogger) {
	}

	async sell(request: ISellRequest): Promise<PreparedTransaction> {
		const instructions = await getAuctionHouseSellInstructions({
			connection: this.connection,
			auctionHouse: request.auctionHouse,
			price: request.price,
			mint: request.mint,
			signer: request.signer,
			tokensAmount: request.tokensAmount,
		})

		return new PreparedTransaction(
			this.connection,
			instructions,
			request.signer,
			this.logger,
			() => {
				this.logger.log(
					"Set",
					request.tokensAmount,
					request.mint.toString(),
					"for sale for",
					request.price,
					"from your account with Auction House",
					request.auctionHouse.toString(),
				)
			}
		)
	}

	async buy(request: IBuyRequest): Promise<PreparedTransaction> {
		const instructions = await getActionHouseBuyInstructions({
			connection: this.connection,
			auctionHouse: request.auctionHouse,
			price: request.price,
			mint: request.mint,
			signer: request.signer,
			tokensAmount: request.tokensAmount,
			tokenAccount: request.tokenAccount,
		})

		return new PreparedTransaction(
			this.connection,
			instructions,
			request.signer,
			this.logger,
			() => {
				this.logger.log("Made offer for ",
					request.mint.toString(),
					"for",
					request.price
				)
			}
		)
	}

	async cancel(request: ICancelRequest): Promise<PreparedTransaction> {
		const instructions = await getAuctionHouseCancelInstructions({
			connection: this.connection,
			auctionHouse: request.auctionHouse,
			price: request.price,
			mint: request.mint,
			signer: request.signer,
			tokensAmount: request.tokensAmount,
		})

		return new PreparedTransaction(
			this.connection,
			instructions,
			request.signer,
			this.logger,
			() => {
				this.logger.log("Cancelled order of",
					request.tokensAmount,
					request.mint.toString(),
					"for",
					request.price,
				)
			}
		)
	}

	async acceptBid(request: ISellRequest): Promise<PreparedTransaction> {
		return this.sell(request)
	}

	async bid(request: IBuyRequest): Promise<PreparedTransaction> {
		return this.buy(request)
	}

	async executeSell(request: IExecuteSellRequest): Promise<PreparedTransaction> {
		const instructions = await getAuctionHouseExecuteSellInstructions({
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

		return new PreparedTransaction(
			this.connection,
			instructions,
			request.signer,
			this.logger,
			() => {
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
			}
		)
	}
}