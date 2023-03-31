import type { AbstractConnectionProvider, ConnectionProvider } from "@rarible/connector"
import type { TezosProviderConnectionResult } from "@rarible/connector-beacon"
import { TezosWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import type { IWalletAndAddress } from "./wallet-connection"

export function mapTezosWallet<O>(
	provider: AbstractConnectionProvider<O, TezosProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(async state => {
		const {
			beacon_provider: createBeaconProvider,
		} = await import("@rarible/tezos-sdk/dist/providers/beacon/beacon_provider")
		const provider = await createBeaconProvider(state.wallet as any, state.toolkit)

		return {
			wallet: new TezosWallet(provider),
			address: state.address,
			blockchain: Blockchain.TEZOS,
		}
	})
}
