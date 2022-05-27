import type { Connection, PublicKey } from "@solana/web3.js"
import type { u64 } from "@solana/spl-token"
import type { IWalletSigner } from "@rarible/solana-wallet"
import type { DebugLogger } from "../../logger/debug-logger"
import type { TransactionResult } from "../../types"
import { PreparedTransaction } from "../prepared-transaction"
import { getMintNftInstructions } from "./mint/mint"
import { getTokenTransferInstructions } from "./mint/transfer"
import { getTokenBurnInstructions } from "./mint/burn"

export interface IMintRequest {
	metadataUrl: string
	signer: IWalletSigner
	maxSupply: number
	collection: PublicKey | null
}

export type IMintResponse = {tx: PreparedTransaction, mint: PublicKey}

export interface ITransferRequest {
	signer: IWalletSigner
	tokenAccount: PublicKey
	to: PublicKey
	mint: PublicKey
	amount: number | u64
}

export interface IBurnRequest {
	signer: IWalletSigner
	mint: PublicKey
	tokenAccount: PublicKey
	amount: number | u64
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
		const { mint, ...instructions } = await getMintNftInstructions(
			this.connection,
			request.signer,
			{
				metadataLink: request.metadataUrl,
				//mutableMetadata: true,
				collection: request.collection,
				maxSupply: request.maxSupply,
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