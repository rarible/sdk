import type { AbstractConnectionProvider, ConnectionProvider } from "@rarible/connector"
import type { FlowProviderConnectionResult } from "@rarible/connector-fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import type { WalletAndAddress } from "./common"

export function mapFlowWallet<O>(
	provider: AbstractConnectionProvider<O, FlowProviderConnectionResult>
): ConnectionProvider<O, WalletAndAddress> {
	return provider.map(state => ({
		wallet: new FlowWallet(state.fcl),
		address: state.address,
	}))
}
