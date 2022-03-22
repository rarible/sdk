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

// eslint-disable-next-line no-undef
export type ITransferResponse = Awaited<ReturnType<typeof actions.sendToken>>

export interface IBurnRequest {
	signer: IWalletSigner
	mint: PublicKey
	owner?: PublicKey
	token: PublicKey
	amount: number | u64
	closeAssociatedAccount?: boolean
}

// eslint-disable-next-line no-undef
export type IBurnResponse = Awaited<ReturnType<typeof actions.burnToken>>

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
			token: request.token,
			mint: request.mint,
			amount: request.amount,
			owner: request.owner,
			close: request.closeAssociatedAccount ?? true,
		})
	}
}