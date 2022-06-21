import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { Blockchain } from "@rarible/api-client"

interface Transaction<T extends Blockchain> {
	blockchain: T
	hash: string
}

export interface TransactionIndexer extends Record<Blockchain, any> {
	"ETHEREUM": EthereumTransaction
	"FLOW": FlowTransaction // @todo add typings from flow-sdk
}

/**
 *
 * @property {Blockchain} blockchain blockchain name enum
 * @property {TransactionIndexer[Blockchain]} transaction transaction object
 * @property {string} hash transaction hash
 * @property {() => Promise<Transaction>} wait wait for transaction
 * @property {string} getTxLink transaction details link
 */
export interface IBlockchainTransaction<T extends Blockchain = Blockchain> {
	blockchain: T
	transaction: TransactionIndexer[T]
	hash(): string
	wait(): Promise<Transaction<T>>
	getTxLink(): string
}

export interface FlowTransaction {
	txId: string
	status: number
	events: any[]
}
