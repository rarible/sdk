import { Blockchain } from "@rarible/api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
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
