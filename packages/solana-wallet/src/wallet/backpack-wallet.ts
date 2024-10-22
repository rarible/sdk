import type { PublicKey, Transaction } from "@solana/web3.js"
import type {
  SolanaEncoding,
  SolanaSignature,
  SolanaSigner,
  TransactionOrVersionedTransaction,
} from "@rarible/solana-common"

export type BackpackProvider = {
  publicKey: PublicKey
  signTransaction: (transaction: Transaction, publicKey?: PublicKey | null) => Promise<Transaction>
  signAllTransactions(transactions: Transaction[], publicKey?: PublicKey | null): Promise<Transaction[]>
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
}

export class BackpackSigner implements SolanaSigner {
  constructor(private readonly provider: BackpackProvider) {}

  get publicKey() {
    return this.provider.publicKey
  }

  signTransaction(transaction: TransactionOrVersionedTransaction): Promise<TransactionOrVersionedTransaction> {
    return this.provider.signTransaction(transaction as Transaction)
  }

  signAllTransactions(transactions: TransactionOrVersionedTransaction[]): Promise<TransactionOrVersionedTransaction[]> {
    return this.provider.signAllTransactions(transactions as Transaction[])
  }

  signMessage(message: Uint8Array, display?: SolanaEncoding | undefined): Promise<SolanaSignature> {
    return this.provider.signMessage(message).then(({ signature }) => ({
      publicKey: this.publicKey,
      signature,
    }))
  }
}
