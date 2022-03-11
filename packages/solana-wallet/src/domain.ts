import type { PublicKey, Transaction } from "@solana/web3.js"

export interface IWalletSigner {
	get publicKey(): PublicKey
	signTransaction(tx: Transaction): Promise<Transaction>
	signAllTransactions(txs: Transaction[]): Promise<Transaction[]>
}

export type DisplayEncoding = "utf8" | "hex"

export interface SolanaWalletProvider {
	publicKey: PublicKey
	signTransaction: (transaction: Transaction) => Promise<Transaction>
	signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
	signMessage: (
		message: Uint8Array | string,
		display?: DisplayEncoding
	) => Promise<any>
}