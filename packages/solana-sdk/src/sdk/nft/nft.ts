import type { Connection, PublicKey } from "@solana/web3.js"
import { actions } from "@metaplex/js"
import type { u64 } from "@solana/spl-token"
import type { IWalletSigner } from "@rarible/solana-wallet"
import type { DebugLogger } from "../../logger/debug-logger"
import { sendTransactionWithRetry } from "../../common/transactions"
import type { TransactionResult } from "../../types"
import { getMintNftInstructions } from "./mint/mint"

export interface IMintRequest {
	metadataUrl: string
	signer: IWalletSigner
	maxSupply: number
	collection: PublicKey | null
}

export type IMintResponse = TransactionResult & {mint: PublicKey}

export interface ITransferRequest {
	signer: IWalletSigner
	tokenAccount: PublicKey
	to: PublicKey
	mint: PublicKey
	amount: number | u64
}

export type ITransferResponse = TransactionResult

export interface IBurnRequest {
	signer: IWalletSigner
	mint: PublicKey
	owner?: PublicKey
	tokenAccount: PublicKey
	amount: number | u64
	closeAssociatedAccount?: boolean
}

export type IBurnResponse = TransactionResult

export interface ISolanaNftSdk {
	mint(request: IMintRequest): Promise<IMintResponse>
	transfer(request: ITransferRequest): Promise<ITransferResponse>
	burn(request: IBurnRequest): Promise<IBurnResponse>
}

export class SolanaNftSdk implements ISolanaNftSdk {
	constructor(private readonly connection: Connection, private readonly logger: DebugLogger) {
	}

	async mint(request: IMintRequest): Promise<IMintResponse> {
		const { instructions, signers, mint } = await getMintNftInstructions(
			this.connection,
			request.signer,
			request.metadataUrl,
			true, // mutable metadata ?
			request.collection, // verify strategy ?
			request.maxSupply
		)

		const res = await sendTransactionWithRetry(
			this.connection,
			request.signer,
			instructions,
			signers,
			"singleGossip",
			this.logger
		)

		this.logger.log(`NFT created ${res.txId}`)
		this.logger.log(`NFT: Mint Address is ${mint.toString()}`)

		return {
			...res,
			mint,
		}
	}

	async transfer(request: ITransferRequest): Promise<ITransferResponse> {
		return actions.sendToken({
			connection: this.connection,
			wallet: request.signer,
			source: request.tokenAccount,
			destination: request.to,
			mint: request.mint,
			amount: request.amount,
		})
	}

	async burn(request: IBurnRequest): Promise<IBurnResponse> {
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