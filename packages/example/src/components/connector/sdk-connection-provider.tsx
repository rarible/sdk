import React, { useContext } from "react"
import { useRxOrThrow } from "@rixio/react"
import { createRaribleSdk } from "@rarible/sdk"
import type { ConnectionState } from "@rarible/connector"
import { IConnector, getStateDisconnected, Connector } from "@rarible/connector"
import { IRaribleSdk } from "@rarible/sdk/build/domain"
import { EnvironmentContext } from "./environment-selector-provider"
import type { IWalletAndAddress } from "@rarible/connector-helper"

export interface IConnectorContext {
	connector?: IConnector<string, IWalletAndAddress>
	state: ConnectionState<IWalletAndAddress>
	sdk?: IRaribleSdk
	walletAddress?: string
}

export const ConnectorContext = React.createContext<IConnectorContext>({
	connector: undefined,
	state: getStateDisconnected(),
	sdk: undefined,
	walletAddress: undefined
})

export interface ISdkConnectionProviderProps {
	connector: Connector<string, IWalletAndAddress>
}

export function SdkConnectionProvider({ connector, children }: React.PropsWithChildren<ISdkConnectionProviderProps>) {
	const {environment} = useContext(EnvironmentContext)
	const conn = useRxOrThrow(connector.connection)
	const sdk = conn.status === "connected" ? createRaribleSdk(conn.connection.wallet, environment) : undefined

	const context: IConnectorContext = {
		connector,
		state: conn,
		sdk,
		walletAddress: conn.status === "connected" ? conn.connection.blockchain + ":" + conn.connection.address : undefined,
	}

	return <ConnectorContext.Provider value={context}>
		{children}
	</ConnectorContext.Provider>
}
