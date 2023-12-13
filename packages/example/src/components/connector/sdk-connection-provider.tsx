import React, { useContext } from "react"
import { useRxOrThrow } from "@rixio/react"
import { createRaribleSdk, WalletType } from "@rarible/sdk"
import type { ConnectionState, Connector, IConnector } from "@rarible/connector"
import { getStateDisconnected } from "@rarible/connector"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import type { UnionAddress } from "@rarible/types/build/union-address"
import { toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { IRaribleSdk } from "@rarible/sdk/build/domain"
import { LogsLevel } from "@rarible/sdk/build/domain"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import { EnvironmentContext } from "./environment-selector-provider"

export interface IConnectorContext {
	connector?: IConnector<string, IWalletAndAddress>
	state: ConnectionState<IWalletAndAddress>
	sdk?: IRaribleSdk
	walletAddress?: UnionAddress
}

export const ConnectorContext = React.createContext<IConnectorContext>({
	connector: undefined,
	state: getStateDisconnected(),
	sdk: undefined,
	walletAddress: undefined,
})

export interface ISdkConnectionProviderProps {
	connector: Connector<string, IWalletAndAddress>
}

function getWalletAddress(address: string, blockchain: Blockchain): UnionAddress {
	switch (blockchain) {
		case Blockchain.ETHEREUM:
		case Blockchain.POLYGON:
		case Blockchain.MANTLE:
		case Blockchain.ARBITRUM:
		case Blockchain.ZKSYNC:
		case Blockchain.IMMUTABLEX:
			return toUnionAddress("ETHEREUM:" + address)
		case Blockchain.FLOW:
		case Blockchain.SOLANA:
		case Blockchain.TEZOS:
			return toUnionAddress(blockchain + ":" + address)
		default:
			throw new Error("Unsupported blockchain " + blockchain)
	}
}

export function SdkConnectionProvider({ connector, children }: React.PropsWithChildren<ISdkConnectionProviderProps>) {
	const { environment } = useContext(EnvironmentContext)
	const conn = useRxOrThrow(connector.connection)
	const sdk = conn.status === "connected" ? createRaribleSdk(conn.connection.wallet, environment, {
		logs: LogsLevel.ERROR,
		apiKey: getApiKey(environment),
		blockchain: {
			[WalletType.ETHEREUM]: {
				useDataV3: true,
				marketplaceMarker: "0x12345678900000000000000000000000000123456789face",
			},
		},
	}) : undefined

	const context: IConnectorContext = {
		connector,
		state: conn,
		sdk,
		walletAddress: conn.status === "connected" ?
			getWalletAddress(conn.connection.address, conn.connection.blockchain) :
			undefined,
	}

	return <ConnectorContext.Provider value={context}>
		{children}
	</ConnectorContext.Provider>
}

function getApiKey(env: RaribleSdkEnvironment) {
	if (env === "prod") return process.env.REACT_APP_PROD_API_KEY
	return process.env.REACT_APP_TESTNETS_API_KEY ?? undefined
}
