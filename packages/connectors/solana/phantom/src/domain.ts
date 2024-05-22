import type { PublicKey } from "@solana/web3.js"
import type { SolanaEmitter, TransactionOrVersionedTransaction, SolanaEncoding } from "@rarible/solana-common"

export type PhantomConnectOptions = {
  onlyIfTrusted?: boolean
}

export type PhantomProvider = SolanaEmitter & {
  publicKey: PublicKey | null
  isConnected: boolean | null
  isPhantom: boolean
  signTransaction: (transaction: TransactionOrVersionedTransaction) => Promise<TransactionOrVersionedTransaction>
  signAllTransactions: (
    transactions: TransactionOrVersionedTransaction[],
  ) => Promise<TransactionOrVersionedTransaction[]>
  signMessage: (message: Uint8Array | string, display?: SolanaEncoding) => Promise<{ signature: Uint8Array }>
  connect: (opts: PhantomConnectOptions) => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
}

export interface WindowWithPhantomProvider extends Window {
  phantom?: { solana?: PhantomProvider }
}
