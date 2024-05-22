import type { PublicKey, Transaction } from "@solana/web3.js"
import type { SolanaEncoding, SolanaSignature, SolanaSigner, TransactionOrVersionedTransaction } from "./provider"

/**
 * This module is mainly exists because of solana's introduction of new
 * kind of transactions - `VersionedTransaction`.
 *
 * This back-compatibility module provides a simple way to
 * maintain back-compat with the libraries that are not supporting
 * the new transaction kind.
 */

export type SolanaLegacySigner = {
  publicKey: PublicKey
  signTransaction: (transaction: TransactionOrVersionedTransaction) => Promise<Transaction>
  signAllTransactions: (transactions: TransactionOrVersionedTransaction[]) => Promise<Transaction[]>
  signMessage: (message: Uint8Array, display?: SolanaEncoding) => Promise<SolanaSignature>
}

export function toSolanaLegacySigner(signer: SolanaSigner): SolanaLegacySigner {
  const signTransaction = (tx: TransactionOrVersionedTransaction) =>
    isTransaction(tx)
      ? signer.signTransaction(tx).then(x => x as Transaction)
      : Promise.reject(new VersioningTransactionIsNotSupported())

  const signAllTransactions = async (txs: TransactionOrVersionedTransaction[]) =>
    Promise.all(txs.map(x => signTransaction(x)))

  return {
    publicKey: signer.publicKey,
    signTransaction,
    signAllTransactions,
    signMessage: signer.signMessage.bind(signer),
  }
}

function isTransaction(tx: TransactionOrVersionedTransaction): tx is Transaction {
  return "partialSign" in tx
}

class VersioningTransactionIsNotSupported extends Error {
  constructor() {
    super("Versioning transaction is not supported for legacy providers")
    this.name = "VersioningTransactionIsNotSupported"
  }
}
