import type { Blockchain } from "@rarible/api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { OperationResult } from "tezos-sdk-module/dist/common/base"
import type { FlowTransaction } from "@rarible/flow-sdk/build/types"
import type { IBlockchainTransaction } from "./domain"

export class BlockchainEthereumTransaction implements IBlockchainTransaction {
	blockchain: Blockchain = "ETHEREUM"

	constructor(public transaction: EthereumTransaction) {}

	hash() {
		return this.transaction.hash
	}

	async wait() {
		await this.transaction.wait()

		return {
			blockchain: this.blockchain,
			hash: this.transaction.hash,
		}
	}
}

export class BlockchainTezosTransaction implements IBlockchainTransaction {
	blockchain: Blockchain = "TEZOS"

	constructor(public transaction: OperationResult) {}

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
}

export class BlockchainFlowTransaction implements IBlockchainTransaction {
	blockchain: Blockchain = "FLOW"

	constructor(public transaction: FlowTransaction) {
	}

	hash() {
		return this.transaction.txId
	}

	async wait() {
		return {
			blockchain: this.blockchain,
			hash: this.transaction.txId,
		}
	}
}

export * from "./domain"
