import React, { useContext, useEffect, useMemo, useState } from "react"
import { createRaribleSdk, WalletType } from "@rarible/sdk"
import type { ConnectionState, IConnector } from "@rarible/connector"
import { getStateDisconnected } from "@rarible/connector"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import type { UnionAddress } from "@rarible/types/build/union-address"
import { toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import type { IRaribleSdk, IRaribleSdkConfig } from "@rarible/sdk/build/domain"
import { LogsLevel } from "@rarible/sdk/build/domain"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import { isEVMBlockchain } from "@rarible/sdk-common"
import { useEnvironmentContext } from "./env"
import { getConnector } from "./connectors-setup"

export type SdkContextValue = {
	connector: IConnector<string, IWalletAndAddress>
	state: ConnectionState<IWalletAndAddress>
	sdk: IRaribleSdk
	walletAddress: UnionAddress | undefined
}

export const sdkContext = React.createContext<SdkContextValue | undefined>(undefined)

export function SdkContextProvider({ children }: React.PropsWithChildren<{}>) {
	const { environment } = useEnvironmentContext()
	const [state, setState] = useState<ConnectionState<IWalletAndAddress>>(() => getStateDisconnected())
	const connector = useMemo(() => getConnector(environment), [environment])
	const active = useMemo(() => extractActiveConnection(state), [state])

	useEffect(() => {
		const sub = connector.connection.subscribe(x => setState(x))
		return () => sub.unsubscribe()
	}, [connector])


	const sdk = useMemo(() => {
		return createRaribleSdk(active?.wallet, environment, createRaribleConfig(environment))
	}, [active, environment])

	const walletAddress = useMemo(() => {
		if (active) return getWalletAddress(active.address, active.blockchain)
		return undefined
	}, [active])

	return (
		<sdkContext.Provider
			value={{ connector, state, sdk, walletAddress }}
			children={children}
		/>
	)
}

export function useSdkContext() {
	const ctx = useContext(sdkContext)
	if (!ctx) throw new Error("No sdk context provider is rendered")
	return ctx
}

function extractActiveConnection(state: ConnectionState<IWalletAndAddress> | undefined) {
	if (state && state.status === "connected") return state.connection
	return undefined
}

function createRaribleConfig(environment: RaribleSdkEnvironment): IRaribleSdkConfig {
	return {
		logs: LogsLevel.ERROR,
		apiKey: getApiKey(environment),
		blockchain: {
			[WalletType.ETHEREUM]: {
				marketplaceMarker: "0x12345678900000000000000000000000000123456789face",
			},
		},
	}
}

function getWalletAddress(address: string, blockchain: Blockchain): UnionAddress {
	if (isEVMBlockchain(blockchain) || blockchain === Blockchain.IMMUTABLEX) {
		return toUnionAddress("ETHEREUM:" + address)
	}
	return toUnionAddress(blockchain + ":" + address)
}

const apiKeyDictionary: Record<RaribleSdkEnvironment, string | undefined> = {
	prod: process.env.REACT_APP_PROD_API_KEY,
	development: process.env.REACT_APP_TESTNETS_API_KEY,
	testnet: process.env.REACT_APP_TESTNETS_API_KEY
}

function getApiKey(env: RaribleSdkEnvironment) {
	const key = apiKeyDictionary[env]
	if (!key) throw new Error(`No api key is provided for ${env} environment`)
	return key
}