import type { AbstractConnectionProvider, ConnectionProvider } from "@rarible/connector"
import type { FlowProviderConnectionResult } from "@rarible/connector-fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import type { IWalletAndAddress } from "./wallet-connection"

export function mapFlowWallet<O>(
	provider: AbstractConnectionProvider<O, FlowProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => ({
		wallet: new FlowWallet(state.fcl),
		address: state.address,
		blockchain: Blockchain.FLOW,
	}))
}
