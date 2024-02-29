export const e2eProviderSupportedNetworks = ["dev-ethereum", "mumbai", "polygon", "testnet", "mainnet"] as const
export type E2EProviderSupportedNetwork = typeof e2eProviderSupportedNetworks[number]