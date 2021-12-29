export enum Blockchain {
	ETHEREUM = "ETHEREUM",
	POLYGON = "POLYGON",
	FLOW = "FLOW",
	TEZOS = "TEZOS"
}

export interface ProviderConnectionResult {
	blockchain: Blockchain
	address: string
}