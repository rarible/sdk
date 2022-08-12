import React, { useState } from "react"
import { Connector } from "@rarible/connector"
import { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import { getConnector } from "./connectors-setup"

export interface IEnvironmentContext {
	environment: RaribleSdkEnvironment
	setEnvironment?: (env: RaribleSdkEnvironment) => void,
}

export const EnvironmentContext = React.createContext<IEnvironmentContext>({
	environment: "prod",
	setEnvironment: undefined
})

export interface IConnectorComponentProps {
	children: (connector: Connector<string, IWalletAndAddress>) => React.ReactNode
}

const LOCALSTORAGE_KEY = "saved_environment"

function getSavedEnvironment(): RaribleSdkEnvironment {
	const envs = ["development", "testnet", "prod"]
	const saved = localStorage.getItem(LOCALSTORAGE_KEY)
	return saved && envs.includes(saved) ? saved as RaribleSdkEnvironment : "testnet"
}

export function EnvironmentSelectorProvider({ children }: React.PropsWithChildren<IConnectorComponentProps>) {
	const [environment, setEnvironment] = useState<RaribleSdkEnvironment>(getSavedEnvironment())
	const connector = getConnector(environment)

	const context: IEnvironmentContext = {
		environment,
		setEnvironment: (env: RaribleSdkEnvironment) => {
			localStorage.setItem(LOCALSTORAGE_KEY, env)
			setEnvironment(env)
		}
	}

	return <EnvironmentContext.Provider value={context}>
		{children(connector)}
	</EnvironmentContext.Provider>
}
