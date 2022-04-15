import type { Connection, PublicKey } from "@solana/web3.js"
import { actions } from "@metaplex/js"
import type { u64 } from "@solana/spl-token"
import type { IWalletSigner } from "@rarible/solana-wallet"
import type { DebugLogger } from "../../logger/debug-logger"
import type { TransactionResult } from "../../types"
import { PreparedTransaction } from "../prepared-transaction"
import { getMintNftInstructions } from "./mint/mint"

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
	owner?: PublicKey
	tokenAccount: PublicKey
	amount: number | u64
	closeAssociatedAccount?: boolean
}

export interface ISolanaNftSdk {
	mint(request: IMintRequest): Promise<IMintResponse>
	transfer(request: ITransferRequest): Promise<TransactionResult>
	burn(request: IBurnRequest): Promise<TransactionResult>
}

export class SolanaNftSdk implements ISolanaNftSdk {
	constructor(private readonly connection: Connection, private readonly logger: DebugLogger) {
	}

	async mint(request: IMintRequest): Promise<IMintResponse> {
		const { mint, ...instructions } = await getMintNftInstructions(
			this.connection,
			request.signer,
			request.metadataUrl,
			true, // mutable metadata ?
			request.collection, // verify strategy ?
			request.maxSupply,
			true
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

	async transfer(request: ITransferRequest): Promise<TransactionResult> {
		return actions.sendToken({
			connection: this.connection,
			wallet: request.signer,
			source: request.tokenAccount,
			destination: request.to,
			mint: request.mint,
			amount: request.amount,
		})
	}

	async burn(request: IBurnRequest): Promise<TransactionResult> {
		return actions.burnToken({
			connection: this.connection,
			wallet: request.signer,
			token: request.tokenAccount,
			mint: request.mint,
			amount: request.amount,
			owner: request.owner,
			close: request.closeAssociatedAccount ?? true,
		})
	}
}