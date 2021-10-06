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

interface TransactionIndexer extends Record<Blockchain, any> {
	"ETHEREUM": EthereumTransaction
	"FLOW": any // @todo add typings from flow-sdk
}

export interface IBlockchainTransaction<T extends Blockchain = Blockchain> {
	blockchain: T
	transaction: TransactionIndexer[T]

	(type: T, transaction: TransactionIndexer[T]): IBlockchainTransaction<T>

	once<T extends BlockchainTransactionStatusEnum>(
		type: T,
		handler: (data: BlockchainTransactionDictionary[T]) => void
	): void

	/**
	 * @param type if exists will wait for concrete status OR it'll wait for `CONFIRMED`
	 */
	wait<T extends BlockchainTransactionStatusEnum>(type?: T): Promise<BlockchainTransactionDictionary[T]>
}