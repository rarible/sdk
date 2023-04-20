export type SolanaAuctionHouseMapping = Record<string, {
	address: string,
	baseFee: number,
}>

export interface ISolanaSdkConfig {
	auctionHouseMapping?: SolanaAuctionHouseMapping
	endpoint?: string
}
