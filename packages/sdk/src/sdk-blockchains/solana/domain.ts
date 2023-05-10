import type { CommonTokenMetadata } from "../../types/nft/mint/preprocess-meta"
import type { UnionPart } from "../../types/order/common"
import type { CommonTokenContent } from "../../types/nft/mint/preprocess-meta"

export type SolanaAuctionHouseMapping = Record<string, {
	address: string,
	baseFee: number,
}>

export interface ISolanaSdkConfig {
	auctionHouseMapping?: SolanaAuctionHouseMapping
	endpoint?: string
}

export interface ISolanaTokenMetadata extends CommonTokenMetadata {
	symbol: string
	image: CommonTokenContent
	royalties?: UnionPart
}

export interface ISolanaMetadataResponse {
	name: string
	symbol?: string
	description?: string
	"seller_fee_basis_points"?: number
	image?: string
	"animation_url"?: string
	"external_url"?: string
	attributes?: {"trait_type": string, value: string}[]
	properties: {
		files?: {
			uri: string,
			type: string,
			// cdn?: boolean
		}[]
		creators?: {
			address: string,
			share: number
		}[]
	}
}
