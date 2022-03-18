import type { Commitment, Connection } from "@solana/web3.js"
import type { PublicKey } from "@solana/web3.js"

export interface ISolanaBalancesSdk {
	getBalance(publicKey: PublicKey, options?: {commitment?: Commitment}): Promise<number>;
	getTokenBalance(owner: PublicKey, mint: PublicKey): Promise<number>
}

export class SolanaBalancesSdk implements ISolanaBalancesSdk {
	constructor(private readonly connection: Connection) {
	}

	getBalance(publicKey: PublicKey, options: {commitment?: Commitment} = {}): Promise<number> {
		return this.connection.getBalance(publicKey, options.commitment)
	}

	async getTokenBalance(owner: PublicKey, mint: PublicKey): Promise<number> {
		const balance = await this.connection.getTokenAccountsByOwner(owner, { mint })
		return balance.value?.length
	}
}