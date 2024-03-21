import type { PublicKey } from "@solana/web3.js"
import type { SolanaEmitter, SolanaEncoding, TransactionOrVersionedTransaction } from "@rarible/solana-common"

export type SalmonProvider = SolanaEmitter & {
	publicKey: PublicKey | null
	isConnected: boolean
	signTransaction: (transaction: TransactionOrVersionedTransaction) => Promise<TransactionOrVersionedTransaction>
	signAllTransactions: (
		transactions: TransactionOrVersionedTransaction[]
	) => Promise<TransactionOrVersionedTransaction[]>
	signMessage: (message: Uint8Array | string, display?: SolanaEncoding) => Promise<{ signature: Uint8Array }>
	connect: () => Promise<{ publicKey: PublicKey }>
	disconnect: () => Promise<void>
}

export interface WindowWithSalmonProvider extends Window {
	salmon?: SalmonProvider
}