import type { Connection, PublicKey } from "@solana/web3.js"
import type { BigNumberValue } from "@rarible/utils"
import type { IWalletSigner } from "@rarible/solana-wallet"
import type { DebugLogger } from "../../logger/debug-logger"
import type { TransactionResult } from "../../types"
import { PreparedTransaction } from "../prepared-transaction"
import { getMintNftInstructions } from "./methods/mint"
import { getTokenTransferInstructions } from "./methods/transfer"
import { getTokenBurnInstructions } from "./methods/burn"

export type IMintRequest = {
	metadataUrl: string
	signer: IWalletSigner
	collection: PublicKey | null
} & ({
	masterEditionSupply: number, // for master edition
} | {
	amount: number, // for multiple items
})

export type IMintResponse = {tx: PreparedTransaction, mint: PublicKey}

export interface ITransferRequest {
	signer: IWalletSigner
	tokenAccount: PublicKey
	to: PublicKey
	mint: PublicKey
	amount: BigNumberValue
}

export interface IBurnRequest {
	signer: IWalletSigner
	mint: PublicKey
	tokenAccount: PublicKey
	amount: BigNumberValue
	owner?: PublicKey
	closeAssociatedAccount?: boolean
}

export interface ISolanaNftSdk {
	mint(request: IMintRequest): Promise<IMintResponse>
	transfer(request: ITransferRequest): Promise<PreparedTransaction>
	burn(request: IBurnRequest): Promise<PreparedTransaction>
}

export class SolanaNftSdk implements ISolanaNftSdk {
	constructor(private readonly connection: Connection, private readonly logger: DebugLogger) {
	}

	async mint(request: IMintRequest): Promise<IMintResponse> {
		let masterEditionSupply: number | undefined
		let amount: number

		if ("amount" in request) {
			amount = request.amount
			masterEditionSupply = undefined
		} else {
			masterEditionSupply = request.masterEditionSupply
			amount = 1
		}

		const { mint, ...instructions } = await getMintNftInstructions(
			this.connection,
			request.signer,
			{
				metadataLink: request.metadataUrl,
				//mutableMetadata: true,
				collection: request.collection,
				masterEditionSupply,
				amount,
				verifyCreators: true,
			}
		)

		return {
			tx: new PreparedTransaction(
				this.connection,
				instructions,
				request.signer,
				this.logger,
				(tx: TransactionResult) => {
					this.logger.log(`NFT created ${tx.txId}`)
					this.logger.log(`NFT: Mint Address is ${mint.toString()}`)
				}
			),
			mint,
		}
	}

	async transfer(request: ITransferRequest): Promise<PreparedTransaction> {
		const instructions = await getTokenTransferInstructions({
			connection: this.connection,
			signer: request.signer,
			tokenAccount: request.tokenAccount,
			to: request.to,
			mint: request.mint,
			amount: request.amount,
		})

		return new PreparedTransaction(
			this.connection,
			instructions,
			request.signer,
			this.logger,
			() => {
				this.logger.log(`${request.amount.toString()} token(s) ${request.mint.toString()} transferred to ${request.to.toString()}`)
			}
		)
	}

	async burn(request: IBurnRequest): Promise<PreparedTransaction> {
		const instructions = await getTokenBurnInstructions({
			connection: this.connection,
			signer: request.signer,
			tokenAccount: request.tokenAccount,
			mint: request.mint,
			amount: request.amount,
			owner: request.owner,
			close: request.closeAssociatedAccount,
		})

		return new PreparedTransaction(
			this.connection,
			instructions,
			request.signer,
			this.logger,
			() => {
				this.logger.log(`${request.amount.toString()} token(s) ${request.mint.toString()} burned`)
			}
		)
	}
}