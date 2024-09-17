import type { Transaction, PublicKey, VersionedTransaction } from "@solana/web3.js"

export type TransactionOrVersionedTransaction = Transaction | VersionedTransaction

export type SolanaEncoding = "utf8" | "hex"

export type SolanaProviderEvent = "disconnect" | "connect" | "accountChanged"
export type SolanaProviderEventArgs<T extends SolanaProviderEvent> = {
  connect: void
  disconnect: void
  accountChanged: PublicKey | null
}[T]

export type SolanaSignature = {
  publicKey: PublicKey
  signature: Uint8Array
}

export type SolanaEmitter = {
  on: <T extends SolanaProviderEvent>(event: T, handler: (args: SolanaProviderEventArgs<T>) => void) => void
  removeListener: <T extends SolanaProviderEvent>(event: T, handler: (args: SolanaProviderEventArgs<T>) => void) => void
}

export type SolanaConnectResult = {
  initialPublicKey: PublicKey
}

export type SolanaProvider = SolanaEmitter & {
  isConnected: () => boolean
  connect: () => Promise<SolanaConnectResult>
  disconnect?: () => Promise<void>
}

export type SolanaSigner = {
  publicKey: PublicKey
  signTransaction: (transaction: TransactionOrVersionedTransaction) => Promise<TransactionOrVersionedTransaction>
  signAllTransactions: (
    transactions: TransactionOrVersionedTransaction[],
  ) => Promise<TransactionOrVersionedTransaction[]>
  signMessage: (message: Uint8Array, display?: SolanaEncoding) => Promise<SolanaSignature>
}
