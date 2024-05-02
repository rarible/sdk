
export interface AptosProviderConnectionResult {
	provider: any
	network: Network
	address: string
	disconnect?: () => void
}

export enum Network {
	Testnet = "Testnet",
	Mainnet = "Mainnet",
	Devnet = "Devnet",
}
