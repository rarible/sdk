import type { Connection, PublicKey } from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import type { DebugLogger } from "../../logger/debug-logger"
import { getAuctionHouseBuyerEscrow, loadAuctionHouseProgram } from "../../common/auction-house-helpers"
import { getTokenAmount } from "../../common/helpers"
import { PreparedTransaction } from "../prepared-transaction"
import { getActionHouseEscrowWithdrawInstructions } from "./methods/escrow-withdraw"
import { getActionHouseEscrowDepositInstructions } from "./methods/escrow-deposit"


export interface IGetEscrowBalanceRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	wallet: PublicKey
}

export interface IWithdrawEscrowRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	amount: number
}

export interface IDepositEscrowRequest {
	auctionHouse: PublicKey
	signer: IWalletSigner
	amount: number
}

export interface ISolanaAuctionHouseSdk {
	getEscrowBalance(request: IGetEscrowBalanceRequest): Promise<number>
	withdrawEscrow(request: IWithdrawEscrowRequest): Promise<PreparedTransaction>
	depositEscrow(request: IDepositEscrowRequest): Promise<PreparedTransaction>
}

export class SolanaAuctionHouseSdk implements ISolanaAuctionHouseSdk {
	constructor(private readonly connection: Connection, private readonly logger: DebugLogger) {
	}

	async getEscrowBalance(request: IGetEscrowBalanceRequest): Promise<number> {
		const anchorProgram = await loadAuctionHouseProgram(this.connection, request.signer)
		const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)

		const [escrowPaymentAccount] = await getAuctionHouseBuyerEscrow(
			request.auctionHouse,
			request.wallet,
		)

		const amount = await getTokenAmount(
			this.connection,
			anchorProgram,
			escrowPaymentAccount,
			auctionHouseObj.treasuryMint,
		)

		this.logger.log(
			request.wallet.toString() + " escrow balance: " + amount +
			" (AuctionHouse: " + request.auctionHouse.toString() + ")"
		)

		return amount
	}

	async withdrawEscrow(request: IWithdrawEscrowRequest): Promise<PreparedTransaction> {
		const instructions = await getActionHouseEscrowWithdrawInstructions({
			connection: this.connection,
			auctionHouse: request.auctionHouse,
			signer: request.signer,
			amount: request.amount,
		})

		return new PreparedTransaction(
			this.connection,
			instructions,
			request.signer,
			this.logger,
			() => {
				this.logger.log("Withdrew",
				 	request.amount,
				 	"from Auction House Escrow account",
				 )
			}
		)
	}

	async depositEscrow(request: IDepositEscrowRequest): Promise<PreparedTransaction> {
		const instructions = await getActionHouseEscrowDepositInstructions({
			connection: this.connection,
			auctionHouse: request.auctionHouse,
			signer: request.signer,
			amount: request.amount,
		})

		return new PreparedTransaction(
			this.connection,
			instructions,
			request.signer,
			this.logger,
			() => {
				this.logger.log("Deposited",
				 	request.amount,
				 	"to Auction House Escrow account",
				 )
			}
		)
	}
}