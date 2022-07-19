import BigNumber from "bignumber.js"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import type { Commitment, Connection } from "@solana/web3.js"
import type { PublicKey } from "@solana/web3.js"
import type { DebugLogger } from "../../logger/debug-logger"

export interface ISolanaBalancesSdk {
	getBalance(publicKey: PublicKey, options?: {commitment?: Commitment}): Promise<BigNumber>
	getTokenBalance(owner: PublicKey, mint: PublicKey): Promise<BigNumber>
}

export class SolanaBalancesSdk implements ISolanaBalancesSdk {
	constructor(
		private readonly connection: Connection,
		private readonly logger: DebugLogger
	) {
	}
	async getBalance(publicKey: PublicKey, options: {commitment?: Commitment} = {}): Promise<BigNumber> {
		return new BigNumber(
			await this.connection.getBalance(publicKey, options.commitment ?? "confirmed")
		).dividedBy(LAMPORTS_PER_SOL)
	}

	async getTokenBalance(
		owner: PublicKey,
		mint: PublicKey,
		options: {commitment?: Commitment} = {}
	): Promise<BigNumber> {
		const accounts = await this.connection.getTokenAccountsByOwner(owner, { mint })

		let res = new BigNumber(0)
		for (let tokenAccount of accounts.value) {
			const balance = await this.connection.getTokenAccountBalance(tokenAccount.pubkey, options.commitment ?? "confirmed")
			res = res.plus(new BigNumber(balance?.value?.uiAmountString ?? 0))
		}

		this.logger.log(`Wallet ${owner} have ${res} of ${mint.toString()} tokens`)
		return res
	}
}