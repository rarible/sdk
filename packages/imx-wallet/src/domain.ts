import type { Link } from "@imtbl/imx-sdk"

export type ImxNetwork = "mainnet" | "ropsten"
export type ImxEnv = "dev" | "prod"

export enum ImxWalletProviderEnum {
	METAMASK = "METAMASK",
	MAGIC_LINK = "MAGIC_LINK",
	WALLET_CONNECT = "WALLET_CONNECT",
	GAMESTOP = "GAMESTOP",
	NONE = "NONE"
}

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

export type ImxConnectionData = ImxConnectResult & {
	link: Link
	status: ImxWalletConnectionStatus
}

export type ImxWalletConnectionStatus = "connected" | "disconnected"
