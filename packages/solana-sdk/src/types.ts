export interface SolAssetType {
	assetClass: "SOL"
}

export interface SplAssetType {
	assetClass: "SPL"
	mint: string
}

export interface TransactionResult {
	txId: string,
	slot: number
}