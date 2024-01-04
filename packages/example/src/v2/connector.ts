import type { IWalletAndAddress } from "@rarible/connector-helper"
import type { ConnectionProvider, IConnector } from "@rarible/connector"
import type { InjectedWeb3ConnectionConfig } from "@rarible/connector/src/connectors/ethereum/injected"

type CP = ConnectionProvider<string, IWalletAndAddress>[]

type ConnectorArgs = {
	providers: CP[]
}

/**
 * Create a connector to be used with <Connect>. Simply add needed providers and configure each of them
 * @param args
 */
export function createConnector(args: ConnectorArgs): IConnector<string, IWalletAndAddress> {
	return null as any
}

/**
 * Create ConnectionProvider for injected wallets (metamask and other extenstions)
 */
export function injected(config: InjectedWeb3ConnectionConfig = { prefer: [] }): CP {
	return null as any
}

/**
 * Create ConnectionProvider for blocto wallet
 */
export function blocto(): CP {
	return null as any
}