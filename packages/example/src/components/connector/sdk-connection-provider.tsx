import React, { useContext } from "react"
import { useRxOrThrow } from "@rixio/react"
import { createRaribleSdk, WalletType } from "@rarible/sdk"
import type { ConnectionState } from "@rarible/connector"
import { Connector, getStateDisconnected, IConnector } from "@rarible/connector"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import { UnionAddress } from "@rarible/types/build/union-address"
import { toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { IRaribleSdk } from "@rarible/sdk/build/domain"
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
	walletAddress: undefined
})

export interface ISdkConnectionProviderProps {
	connector: Connector<string, IWalletAndAddress>
}

function getWalletAddress(address: string, blockchain: Blockchain): UnionAddress {
	switch (blockchain) {
		case Blockchain.ETHEREUM:
		case Blockchain.POLYGON:
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
	const {environment} = useContext(EnvironmentContext)
	const conn = useRxOrThrow(connector.connection)
	const sdk = conn.status === "connected" ? createRaribleSdk(conn.connection.wallet, environment, {
    blockchain: {
			[WalletType.ETHEREUM]: {
				useDataV3: true,
				marketplaceMarker: "0x12345678900000000000000000000000000123456789face",
			}
		}
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
