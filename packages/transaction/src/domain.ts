import type { EthereumTransaction } from "@rarible/ethereum-provider/build"
import { BlockchainAddress, BlockchainTransactionHash, BlockchainTypeEnum } from "@rarible/sdk-types"

export enum BlockchainTransactionStatusEnum {
	CONFIRMED = "confirmed",
	SENT = "sent",
	REJECTED = "rejected",
}

interface BlockchainTransactionDictionary extends Record<BlockchainTransactionStatusEnum, any> {
	[BlockchainTransactionStatusEnum.CONFIRMED]: {
		hash: BlockchainTransactionHash
		from: BlockchainAddress
	},
	[BlockchainTransactionStatusEnum.SENT]: {
		hash: BlockchainTransactionHash
		from: BlockchainAddress
	},
	[BlockchainTransactionStatusEnum.REJECTED]: {
		reason: unknown
	},
}

interface TransactionIndexer extends Record<BlockchainTypeEnum, any> {
	[BlockchainTypeEnum.ETHEREUM]: EthereumTransaction
	[BlockchainTypeEnum.FLOW]: any // @todo add typings from flow-sdk
}

export interface IBlockchainTransaction<T extends BlockchainTypeEnum = BlockchainTypeEnum> {
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