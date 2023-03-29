import type { SolflareConfig } from "@solflare-wallet/sdk/src/types"
import type { Transaction, PublicKey } from "@solana/web3.js"

type DisplayEncoding = "utf8" | "hex"
type PhantomEvent = "disconnect" | "connect" | "accountChanged"

export interface ConnectOpts extends SolflareConfig {
}

export interface SolflareProvider {
	publicKey: PublicKey | null
	isConnected: boolean
	connected: boolean
	autoApprove: boolean
	connect(): Promise<void>
	disconnect(): Promise<void>

	signTransaction(transaction: Transaction): Promise<Transaction>
	signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>
	signMessage(data: Uint8Array | string, display?: DisplayEncoding): Promise<Uint8Array>
	sign(data: Uint8Array, display?: DisplayEncoding): Promise<Uint8Array>

	on: (event: PhantomEvent, handler: (args: any) => void) => void
	removeListener: (event: PhantomEvent, handler: (args: any) => void) => void
}