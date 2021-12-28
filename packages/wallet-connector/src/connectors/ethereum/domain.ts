export type EthereumWallet = {
	provider: any
	address: string
	chainId: number
	disconnect?: () => void
}
