import type { AbstractConnectionProvider, ConnectionProvider } from "@rarible/connector"
import type { TezosProviderConnectionResult } from "@rarible/connector-beacon"
import { TezosWallet } from "@rarible/sdk-wallet"
import beacon from "@rarible/tezos-sdk/dist/providers/beacon/beacon_provider"
import type { WalletAndAddress } from "./common"

export function mapTezosWallet<O>(
	provider: AbstractConnectionProvider<O, TezosProviderConnectionResult>
): ConnectionProvider<O, WalletAndAddress> {
	return provider.map(async state => {
		const provider = await beacon.beacon_provider(state.wallet as any, state.toolkit as any)

		return {
			wallet: new TezosWallet(provider),
			address: state.address,
		}
	})
}
