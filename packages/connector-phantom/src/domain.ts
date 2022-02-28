import type { Transaction } from "@solana/web3.js"
import type { ProviderConnectionResult } from "@rarible/connector"

export interface ISolanaProviderConnectionResult extends ProviderConnectionResult {
	publicKey: () => Promise<string>
	signMessage: (message: Uint8Array) => Promise<Uint8Array>
	signTransaction: (transaction: Transaction) => Promise<Transaction>
	signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>
}

export interface ISolanaProvider extends ISolanaProviderConnectionResult {
	isConnected: boolean
	disconnect: () => Promise<void>
	connect: (...args: any[]) => Promise<string>
}