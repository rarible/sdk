import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { SolanaWallet } from "@rarible/sdk-wallet"

export function initSolanaWallet(pk: string | Uint8Array): SolanaWallet {
  const keypairWallet = SolanaKeypairWallet.fromKey(pk)
  return new SolanaWallet(keypairWallet)
}
