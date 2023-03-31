import type { AbstractConnectionProvider, ConnectionProvider } from "@rarible/connector"
import type { FlowProviderConnectionResult } from "@rarible/connector-fcl"
import { FlowWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import type { MattelProviderConnectionResult } from "@rarible/connector-mattel"
import type { IWalletAndAddress } from "./wallet-connection"

export function mapFlowWallet<O>(
	provider: AbstractConnectionProvider<O, FlowProviderConnectionResult | MattelProviderConnectionResult>
): ConnectionProvider<O, IWalletAndAddress> {
	return provider.map(state => ({
		wallet: new FlowWallet(state.fcl, "auth" in state ? state.auth : undefined),
		address: state.address,
		blockchain: Blockchain.FLOW,
	}))
}
