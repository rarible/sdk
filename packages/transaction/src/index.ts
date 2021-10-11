import {IBlockchainTransaction, TransactionIndexer} from "./domain"
import {Blockchain} from "@rarible/api-client";
import type { EthereumTransaction } from "@rarible/ethereum-provider"

export class BlockchainEthereumTransaction implements IBlockchainTransaction {
	blockchain: Blockchain = "ETHEREUM"
	constructor(public transaction: EthereumTransaction) {}

	async wait() {
			const waitResponse = await this.transaction.wait()

			return {
				blockchain: this.blockchain,
				hash: waitResponse.transactionHash
			}
		}
}
