import type { Connection, PublicKey } from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import type { DebugLogger } from "../../logger/debug-logger"
import { PreparedTransaction } from "../prepared-transaction"
import { getTokenAccounts } from "../../tests/common"
import { getAccountInfo } from "../../common/helpers"
import { getAccountRevokeDelegateInstructions } from "./methods/revoke"

export interface ITokenAccountRequest {
	mint: PublicKey
	owner: PublicKey
}

export interface IAccountInfoRequest {
	mint: PublicKey
	tokenAccount: PublicKey
}

export interface IRevokeRequest {
	signer: IWalletSigner
	tokenAccount: PublicKey
}

export interface ISolanaAccountSdk {
	getTokenAccountForMint(request: ITokenAccountRequest): Promise<PublicKey | undefined>
	getAccountInfo(request: IAccountInfoRequest): ReturnType<typeof getAccountInfo>
	revokeDelegate(request: IRevokeRequest): Promise<PreparedTransaction>
}

export class SolanaAccountSdk implements ISolanaAccountSdk {
	constructor(private readonly connection: Connection, private readonly logger: DebugLogger) {
	}

	async getTokenAccountForMint(request: ITokenAccountRequest): Promise<PublicKey | undefined> {
		const tokenAccount = await getTokenAccounts(this.connection, request.owner, request.mint)
		return tokenAccount?.value[0]?.pubkey
	}

	getAccountInfo(request: IAccountInfoRequest): ReturnType<typeof getAccountInfo> {
		return getAccountInfo(this.connection, request.mint, null, request.tokenAccount)
	}

	async revokeDelegate(request: IRevokeRequest): Promise<PreparedTransaction> {
		const instructions = await getAccountRevokeDelegateInstructions({
			connection: this.connection,
			signer: request.signer,
			tokenAccount: request.tokenAccount,
		})

		return new PreparedTransaction(
			this.connection,
			instructions,
			request.signer,
			this.logger,
			() => {
				this.logger.log(`${request.tokenAccount.toString()} delegation revoked`)
			}
		)
	}
}