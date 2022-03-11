import type { Connection, PublicKey } from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { sendTransactionWithRetry } from "../../common/transactions"
import { getVerifyCollectionInstructions } from "./verifyCollection/verify-collection"

export interface IVerifyCollectionRequest {
	signer: IWalletSigner
	mint: PublicKey
	collection: PublicKey
}

// eslint-disable-next-line no-undef
export type VerifyCollectionResponse = Awaited<ReturnType<typeof sendTransactionWithRetry>>

export interface ISolanaCollectionSdk {
	verifyCollection(request: IVerifyCollectionRequest): Promise<VerifyCollectionResponse>
}

export class SolanaCollectionSdk implements ISolanaCollectionSdk {
	constructor(private readonly connection: Connection) {
	}

	async verifyCollection(request: IVerifyCollectionRequest): Promise<VerifyCollectionResponse> {
		const { instructions, signers } = await getVerifyCollectionInstructions({
			connection: this.connection,
			signer: request.signer,
			mint: request.mint,
			collection: request.collection,
		})


		const res = await sendTransactionWithRetry(
			this.connection,
			request.signer,
			instructions,
			signers,
			"max",
		)

		console.log(`Mint ${request.mint.toString()} approved to collection ${request.collection.toString()}`)

		return res
	}
}