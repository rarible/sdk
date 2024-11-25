import type { PublicKey } from "@solana/web3.js"

export interface TransactionResult {
  txId: string
  slot?: number
  orderId?: PublicKey
}
