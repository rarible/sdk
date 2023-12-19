import React, { useContext } from "react"
import { useRxOrThrow } from "@rixio/react"
import { createRaribleSdk, WalletType } from "@rarible/sdk"
import type { IConnector } from "@rarible/connector"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import type { IRaribleSdk } from "@rarible/sdk/build/domain"
import { LogsLevel } from "@rarible/sdk/build/domain"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import { EnvironmentContext } from "./environment-selector-provider"

export const SdkContext = React.createContext<IRaribleSdk | undefined>(undefined)

export interface ISdkConnectionProviderProps {
	connector: IConnector<string, IWalletAndAddress>
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

	return <SdkContext.Provider value={sdk}>
		{children}
	</SdkContext.Provider>
}

export function useSdk() {
	return useContext(SdkContext)
}

function getApiKey(env: RaribleSdkEnvironment) {
	if (env === "prod") return process.env.REACT_APP_PROD_API_KEY
	return process.env.REACT_APP_TESTNETS_API_KEY ?? undefined
}
