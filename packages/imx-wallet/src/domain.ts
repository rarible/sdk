export type ImxNetwork = "mainnet" | "ropsten"
export type ImxEnv = "dev" | "prod"

export type ImxWalletProviderName = "METAMASK" | "MAGIC_LINK" | "WALLET_CONNECT" | "NONE"


export type ImxNetworkConfig = {
	network: ImxNetwork
	linkAddress: string
	gasLimit?: string
	gasPrice?: string
	enableDebug?: boolean
}

export type ImxConnectResult = {
	address: string
	ethNetwork: string
	providerPreference: string
	starkPublicKey: string
}

export type ImxWalletConnectionStatus = "connected" | "disconnected"
