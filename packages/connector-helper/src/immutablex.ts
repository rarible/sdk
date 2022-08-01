import type { AbstractConnectionProvider, ConnectionProvider } from "@rarible/connector"
import { Blockchain } from "@rarible/api-client"
import type { ImxWallet } from "@rarible/immutable-wallet"
import { ImmutableXWallet } from "@rarible/sdk-wallet"
import type { IWalletAndAddress } from "./wallet-connection"

export interface IImmutableXProviderConnectionResult {
	address: string
	wallet: ImxWallet
}

export function mapImmutableXWallet<O>(
	provider: AbstractConnectionProvider<O, IImmutableXProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => ({
		wallet: new ImmutableXWallet(state.wallet),
		address: state.address,
		blockchain: Blockchain.IMMUTABLEX,
	}))
}
