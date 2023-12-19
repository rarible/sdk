import type { ConnectionState, IConnector, ProviderOption } from "@rarible/connector"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import { STATE_INITIALIZING } from "@rarible/connector"
import React, { useContext, useMemo } from "react"
import { useRxOrThrow } from "@rixio/react"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types/build/union-address"
import { toUnionAddress } from "@rarible/types"
import { SdkConnectionProvider } from "../components/connector/sdk-connection-provider"

interface IConnectorContext {
	connector?: IConnector<string, IWalletAndAddress>
	state: ConnectionState<IWalletAndAddress>
}

const ConnectorContext = React.createContext<IConnectorContext>({
	connector: undefined,
	state: STATE_INITIALIZING
})

type ConnectProps = {
	connector: IConnector<string, IWalletAndAddress>
}

export function Connect({ connector, children }: React.PropsWithChildren<ConnectProps>) {
	const state = useRxOrThrow(connector.connection)
	const context: IConnectorContext = useMemo(() => ({ connector, state }), [state, connector])
	return <ConnectorContext.Provider value={context}>
		<SdkConnectionProvider connector={connector} children={children}/>
	</ConnectorContext.Provider>
}

export type ConnectContextCommon = {
	connector: IConnector<string, IWalletAndAddress>
	options: ProviderOption<string, IWalletAndAddress>[]
}

export type ConnectContextConnected = ConnectContextCommon & {
	status: "connected"
	wallet: BlockchainWallet
	address: UnionAddress
	blockchain: Blockchain
	disconnect?: () => Promise<void>
	//todo add back option: string
}

export type ConnectContextDisconnected = ConnectContextCommon & {
	status: "disconnected"
	error?: any
}

export type ConnectContextInitializing = ConnectContextCommon & {
	status: "initializing"
}

export type ConnectContextConnecting = ConnectContextCommon & {
	status: "connecting"
	option: string
}

export type ConnectContext =
	| ConnectContextDisconnected
	| ConnectContextInitializing
	| ConnectContextConnected
	| ConnectContextConnecting

export function useConnect(): ConnectContext {
	const { connector, state } = useContext(ConnectorContext)
	if (connector === undefined) {
		throw new Error("ConnectorContext is not found") //TODO handle better
	}
	const options = connector.getOptions()
	switch (state.status) {
		case "initializing":
			return {
				connector,
				options,
				status: "initializing",
			}
		case "connected":
			return {
				connector,
				options,
				status: "connected",
				address: getWalletAddress(state.connection.address, state.connection.blockchain),
				wallet: state.connection.wallet,
				blockchain: state.connection.blockchain,
				disconnect: state.disconnect
			}
		case "connecting":
			return {
				connector,
				options,
				status: "connecting",
				option: state.providerId
			}
		case "disconnected":
			return {
				connector,
				options,
				status: "disconnected",
			}
		default:
			throw new Error(`Unknown state: ${JSON.stringify(state)}`)
	}
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
