import type { PublicKey } from "@solana/web3.js"
import type { SolanaProvider, SolanaSigner } from "@rarible/solana-common"

export type SolanaProviderAdapter = {
	provider: SolanaProvider
	toSigner: (publicKey: PublicKey) => SolanaSigner
}
