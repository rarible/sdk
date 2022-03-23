import type { Commitment, Connection } from "@solana/web3.js"
import type { PublicKey } from "@solana/web3.js"
import type { DebugLogger } from "../../logger/debug-logger"

// eslint-disable-next-line no-undef
type TokenBalanceResult = Awaited<ReturnType<typeof Connection.prototype.getTokenAccountsByOwner>>

export interface ISolanaBalancesSdk {
	getBalance(publicKey: PublicKey, options?: {commitment?: Commitment}): Promise<number>
	getTokenBalance(owner: PublicKey, mint: PublicKey): Promise<TokenBalanceResult>
}

export class SolanaBalancesSdk implements ISolanaBalancesSdk {
	constructor(private readonly connection: Connection, private readonly logger: DebugLogger) {
	}

	getBalance(publicKey: PublicKey, options: {commitment?: Commitment} = {}): Promise<number> {
		return this.connection.getBalance(publicKey, options.commitment)
	}

	async getTokenBalance(owner: PublicKey, mint: PublicKey): Promise<TokenBalanceResult> {
		const balance = await this.connection.getTokenAccountsByOwner(owner, { mint })
		this.logger.log(mint.toString(), "token balance is", balance.value?.length)
		return balance
	}
}