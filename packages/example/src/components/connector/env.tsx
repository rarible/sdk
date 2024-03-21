import React, { useContext, useEffect, useMemo, useState } from "react"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import { environmentUtils } from "../../common/env"
import type { EnvironmentConfig } from "../../common/env/domain"
import type { ConnectorInstance} from "./connectors-setup"

export type EnvironmentContextValue<T extends RaribleSdkEnvironment = RaribleSdkEnvironment> = {
	environment: T
	envConfig: EnvironmentConfig<T>
	setEnvironment: (env: RaribleSdkEnvironment) => void,
}

export const environmentContext = React.createContext<EnvironmentContextValue | undefined>(undefined)

export type EnvironmentContextProviderProps = {
	children: (connector: ConnectorInstance) => React.ReactNode
}

export function EnvironmentContextProvider({ children }: React.PropsWithChildren<{}>) {
	const [environment, setEnvironment] = useState<RaribleSdkEnvironment>(() => environmentUtils.getDefaultEnvironment())
	useEffect(() => environmentUtils.updateSavedEnvironment(environment), [environment])
	const envConfig = useMemo(() => environmentUtils.getConfig(environment), [environment])

	return <environmentContext.Provider value={{ environment, envConfig, setEnvironment }} children={children} />
}

export function useEnvironmentContext() {
	const ctx = useContext(environmentContext)
	if (!ctx) throw new Error("No environment context found")
	return ctx
}