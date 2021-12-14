import { Blockchain } from "@rarible/api-client"
import type { FlowNetwork, FlowTransaction } from "@rarible/flow-sdk/build/types"
import type { IBlockchainTransaction } from "../domain"

export class BlockchainFlowTransaction implements IBlockchainTransaction {
	blockchain: Blockchain = Blockchain.FLOW

	constructor(public transaction: FlowTransaction, public network: FlowNetwork) {
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

	getTxLink() {
		switch (this.network) {
			case "mainnet": return `https://flowscan.org/transaction/${this.hash()}`
			case "testnet": return `https://testnet.flowscan.org/${this.hash()}`
			case "emulator": return ""
			default: throw new Error("Unsupported transaction network")
		}
	}
}
