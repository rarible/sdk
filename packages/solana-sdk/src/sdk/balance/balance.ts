import { BN } from "@project-serum/anchor"
import type { Commitment, Connection } from "@solana/web3.js"
import type { PublicKey } from "@solana/web3.js"
import type { DebugLogger } from "../../logger/debug-logger"

// eslint-disable-next-line no-undef
type TokenBalanceResult = Awaited<ReturnType<typeof Connection.prototype.getTokenAccountsByOwner>>

export interface ISolanaBalancesSdk {
	getBalance(publicKey: PublicKey, options?: {commitment?: Commitment}): Promise<BN>
	getTokenBalance(owner: PublicKey, mint: PublicKey): Promise<BN>
}

export class SolanaBalancesSdk implements ISolanaBalancesSdk {
	constructor(private readonly connection: Connection, private readonly logger: DebugLogger) {
	}

	async getBalance(publicKey: PublicKey, options: {commitment?: Commitment} = {}): Promise<BN> {
		return new BN(await this.connection.getBalance(publicKey, options.commitment))
	}

	async getTokenBalance(owner: PublicKey, mint: PublicKey): Promise<BN> {
		const accounts = await this.connection.getTokenAccountsByOwner(owner, { mint })

		let res = new BN(0)
		for (let tokenAccount of accounts.value) {
			const balance = await this.connection.getTokenAccountBalance(tokenAccount.pubkey, "max")
			res = res.add(new BN(balance?.value?.uiAmountString ?? "0"))
		}

		this.logger.log(mint.toString(), "token balance is", res)
		return res
	}
}