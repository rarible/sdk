import type { Transaction } from "@solana/web3.js"
import type { ProviderConnectionResult } from "@rarible/connector"

export interface SolanaProviderConnectionResult extends PhantomProvider, ProviderConnectionResult {
}

type DisplayEncoding = "utf8" | "hex"
type PhantomEvent = "disconnect" | "connect" | "accountChanged"
type PhantomRequestMethod =
	| "connect"
	| "disconnect"
	| "signTransaction"
	| "signAllTransactions"
	| "signMessage"

export interface ConnectOpts {
	onlyIfTrusted: boolean
}

type PublicKey = any

export interface PhantomProvider {
	publicKey: PublicKey | null
	isConnected: boolean | null
	signTransaction: (transaction: Transaction) => Promise<Transaction>
	signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
	signMessage: (
		message: Uint8Array | string,
		display?: DisplayEncoding
	) => Promise<any>
	connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>
	disconnect: () => Promise<void>
	on: (event: PhantomEvent, handler: (args: any) => void) => void
	removeListener: (event: PhantomEvent, handler: (args: any) => void) => void
	request: (method: PhantomRequestMethod, params: any) => Promise<unknown>
}