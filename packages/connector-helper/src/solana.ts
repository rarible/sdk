import type { AbstractConnectionProvider, ConnectionProvider } from "@rarible/connector"
import { SolanaWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import type{ SolanaWalletProvider } from "@rarible/solana-wallet"
import type { IWalletAndAddress } from "./wallet-connection"

export interface ISolanaProviderConnectionResult extends SolanaWalletProvider {
	address: string
}

export function mapSolanaWallet<O>(
	provider: AbstractConnectionProvider<O, ISolanaProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => ({
		wallet: new SolanaWallet({
			publicKey: state.publicKey!,
			signTransaction: state.signTransaction,
			signAllTransactions: state.signAllTransactions,
			signMessage: state.signMessage,
		}),
		address: state.address,
		blockchain: Blockchain.SOLANA,
	}))
}
