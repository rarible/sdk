import React, { useContext, useState } from "react"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import type { ConnectorInstance } from "./connectors-setup"

export type ApiKeyContextValue = {
  prodApiKey: string
  testnetApiKey: string
  setProdApiKey: (key: string) => void
  setTestnetApiKey: (key: string) => void
}

export const apiKeyContext = React.createContext<ApiKeyContextValue | undefined>(undefined)

export type EnvironmentContextProviderProps = {
  children: (connector: ConnectorInstance) => React.ReactNode
}

export function ApiKeyContextProvider({ children }: React.PropsWithChildren<{}>) {
  const [prodApiKey, setStateProdApiKey] = useState<string>(
    () => state.getValue(LOCALSTORAGE_API_PROD_KEY) || apiKeyDictionary["prod"] || "",
  )
  const [testnetApiKey, setStateTestnetApiKey] = useState<string>(
    () => state.getValue(LOCALSTORAGE_API_TESTNET_KEY) || apiKeyDictionary["testnet"] || "",
  )

  function setProdApiKey(key: string) {
    state.setValue(LOCALSTORAGE_API_PROD_KEY, key)
    setStateProdApiKey(key)
  }
  function setTestnetApiKey(key: string) {
    state.setValue(LOCALSTORAGE_API_TESTNET_KEY, key)
    setStateTestnetApiKey(key)
  }
  return (
    <apiKeyContext.Provider
      value={{ prodApiKey, testnetApiKey, setProdApiKey, setTestnetApiKey }}
      children={children}
    />
  )
}

export function useApiKeyContext() {
  const ctx = useContext(apiKeyContext)
  if (!ctx) throw new Error("No environment context found")
  return ctx
}

const LOCALSTORAGE_API_PROD_KEY = "sdk_api_prod_key"
export type LOCALSTORAGE_API_PROD_KEY_TYPE = typeof LOCALSTORAGE_API_PROD_KEY
const LOCALSTORAGE_API_TESTNET_KEY = "sdk_api_testnet_key"
export type LOCALSTORAGE_API_TESTNET_KEY_TYPE = typeof LOCALSTORAGE_API_TESTNET_KEY

const state = {
  getValue(key: typeof LOCALSTORAGE_API_PROD_KEY | typeof LOCALSTORAGE_API_TESTNET_KEY): string {
    return localStorage.getItem(key) || ""
  },
  setValue(
    key: typeof LOCALSTORAGE_API_PROD_KEY | typeof LOCALSTORAGE_API_TESTNET_KEY,
    value: string | undefined,
  ): void {
    if (value) return localStorage.setItem(key, value)
    return localStorage.removeItem(key)
  },
}

const apiKeyDictionary: Record<RaribleSdkEnvironment, string | undefined> = {
  prod: process.env.REACT_APP_PROD_API_KEY || "a3a9bdfa-96c2-4e13-a3b3-aea6950d95d1",
  development: process.env.REACT_APP_TESTNETS_API_KEY || "d6dcc43d-8423-4bb4-b1c5-307c42d26efb",
  testnet: process.env.REACT_APP_TESTNETS_API_KEY || "d6dcc43d-8423-4bb4-b1c5-307c42d26efb",
}
