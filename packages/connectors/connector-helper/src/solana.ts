import type { AbstractConnectionProvider, ConnectionProvider } from "@rarible/connector"
import { SolanaWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import type { SolanaSigner } from "@rarible/solana-common"
import type { IWalletAndAddress } from "./wallet-connection"

export function mapSolanaWallet<O>(
	provider: AbstractConnectionProvider<O, SolanaSigner>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(signer => ({
		wallet: new SolanaWallet(signer),
		address: signer.publicKey.toString(),
		blockchain: Blockchain.SOLANA,
	}))
}
