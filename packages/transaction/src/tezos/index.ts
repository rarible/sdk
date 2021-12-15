import { Blockchain } from "@rarible/api-client"
import type { OperationResult } from "tezos-sdk-module/dist/common/base"
import type { TezosNetwork } from "tezos-sdk-module"
import type { IBlockchainTransaction } from "../domain"

export class BlockchainTezosTransaction implements IBlockchainTransaction {
	blockchain: Blockchain = Blockchain.TEZOS

	constructor(public transaction: OperationResult, public network: TezosNetwork) {}

	hash() {
		return this.transaction.hash
	}

	async wait() {
		await this.transaction.confirmation()

		return {
			blockchain: this.blockchain,
			hash: this.transaction.hash,
		}
	}

	getTxLink() {
		switch (this.network) {
			case "mainnet": return `https://tzkt.io/${this.hash()}`
			case "hangzhou": return `https://hangzhou2net.tzkt.io/${this.hash()}`
			default: throw new Error("Unsupported transaction network")
		}
	}
}
