import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { Blockchain } from "@rarible/api-client"

interface Transaction<T extends Blockchain, TransactionResult = void> {
	blockchain: T
	hash: string
	result?: TransactionResult
}

export interface TransactionIndexer extends Record<Blockchain, any> {
	"ETHEREUM": EthereumTransaction
	"FLOW": FlowTransaction // @todo add typings from flow-sdk
}

export interface IBlockchainTransaction<T extends Blockchain = Blockchain, TransactionResult = undefined> {
	blockchain: T
	transaction: TransactionIndexer[T]
	/**
	 * Returns true if there is no transaction data and transaction object should be ignored
	 */
	isEmpty: boolean
	hash(): string
	wait(): Promise<Transaction<T, TransactionResult | undefined>>
	getTxLink(): string
}

export interface FlowTransaction {
	txId: string
	status: number
	events: any[]
}
