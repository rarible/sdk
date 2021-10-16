import { Blockchain } from "@rarible/api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import { OperationResult } from "tezos-sdk-module/dist/common/base"
import { IBlockchainTransaction } from "./domain"

export class BlockchainEthereumTransaction implements IBlockchainTransaction {
	blockchain: Blockchain = "ETHEREUM"
	constructor(public transaction: EthereumTransaction) {}

	async wait() {
		const waitResponse = await this.transaction.wait()

		return {
			blockchain: this.blockchain,
			hash: waitResponse.transactionHash,
		}
	}
}

export class BlockchainTezosTransaction implements IBlockchainTransaction {
	blockchain: Blockchain = "TEZOS"
	constructor(public transaction: OperationResult) {}

	async wait() {
		await this.transaction.confirmation()

		return {
			blockchain: this.blockchain,
			hash: this.transaction.hash,
		}
	}
}

export * from "./domain"
