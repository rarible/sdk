import { Blockchain } from "@rarible/api-client"
import type { TransactionResult } from "@rarible/solana-sdk"
import type { SolanaSdk } from "@rarible/solana-sdk"
import type { IBlockchainTransaction } from "../domain"

export class BlockchainSolanaTransaction implements IBlockchainTransaction {
	blockchain: Blockchain = Blockchain.SOLANA

	constructor(public transaction: TransactionResult, public sdk: SolanaSdk) {}

	hash() {
		return this.transaction.txId
	}

	async wait() {
		const RETRIES_COUNT = 4
		const check = async (retryCount: number) => {
			try {
				// can fail after 30 sec timeout
				await this.sdk.connection.confirmTransaction(this.transaction.txId, "confirmed")
			} catch (e: any) {
				if (e?.message?.includes("Transaction was not confirmed in") && retryCount > 0) {
					await check(retryCount - 1)
				} else {
					throw e
				}
			}
		}

		await check(RETRIES_COUNT)

		return {
			blockchain: this.blockchain,
			hash: this.transaction.txId,
		}
	}

	getTxLink() {
		const url = `https://solscan.io/tx/${this.hash()}`
		switch (this.sdk.cluster) {
			case "mainnet-beta":
				return url
			case "testnet":
			case "devnet":
				return url + `?cluster=${this.sdk.cluster}`
			default: throw new Error("Unsupported transaction network")
		}
	}
}
