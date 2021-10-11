import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { UnionAddress, Blockchain } from "@rarible/api-client"

export enum BlockchainTransactionStatusEnum {
	CONFIRMED = "confirmed",
	SENT = "sent",
	REJECTED = "rejected",
}

interface BlockchainTransactionDictionary extends Record<BlockchainTransactionStatusEnum, any> {
	[BlockchainTransactionStatusEnum.CONFIRMED]: {
		blockchain: Blockchain
		hash: string
		from: UnionAddress
	},
	[BlockchainTransactionStatusEnum.SENT]: {
		blockchain: Blockchain
		hash: string
		from: UnionAddress
	},
	[BlockchainTransactionStatusEnum.REJECTED]: {
		blockchain: Blockchain
		reason: unknown
	},
}

interface Transaction<T extends Blockchain> {
	blockchain: T
	hash: string
}

export interface TransactionIndexer extends Record<Blockchain, any> {
	"ETHEREUM": EthereumTransaction
	"FLOW": any // @todo add typings from flow-sdk
}

export interface IBlockchainTransaction<T extends Blockchain = Blockchain> {
	blockchain: T
	transaction: TransactionIndexer[T]

	wait(): Promise<Transaction<T>>
}
