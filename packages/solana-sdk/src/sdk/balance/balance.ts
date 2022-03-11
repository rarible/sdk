import type { Commitment, Connection, PublicKeyInitData } from "@solana/web3.js"
import { PublicKey } from "@solana/web3.js"
import { isPublicKey } from "../../common/utils"

export interface ISolanaBalancesSdk {
	getBalance(publicKey: PublicKeyInitData | PublicKey, options?: {commitment?: Commitment}): Promise<number>;
}

export class SolanaBalancesSdk implements ISolanaBalancesSdk {
	constructor(private readonly connection: Connection) {
	}

	getBalance(publicKey: PublicKeyInitData | PublicKey, options: {commitment?: Commitment} = {}): Promise<number> {
		if (isPublicKey(publicKey)) {
			return this.connection.getBalance(publicKey, options.commitment)
		} else {
			return this.connection.getBalance(new PublicKey(publicKey), options.commitment)
		}
	}
}