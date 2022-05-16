import type { Blockchain } from "@rarible/api-client"
import type { TezosMetadataResponse } from "../../../sdk-blockchains/tezos/common"
import type { ISolanaMetadataResponse } from "../../../sdk-blockchains/solana/domain"
import type { ISolanaTokenMetadata } from "../../../sdk-blockchains/solana/domain"

export type IPreprocessMeta = (meta: PreprocessMetaRequest) => PreprocessMetaResponse

export type PreprocessMetaRequest =
	({
		blockchain: Blockchain.ETHEREUM | Blockchain.POLYGON | Blockchain.TEZOS | Blockchain.FLOW
	} & CommonTokenMetadata)
	| ({
		blockchain: Blockchain.SOLANA
	} & ISolanaTokenMetadata)

export type PreprocessMetaResponse = CommonTokenMetadataResponse | TezosMetadataResponse | ISolanaMetadataResponse

export type TokenMetadataAttribute = {
	key: string
	value: string
	type?: string
}

export type CommonTokenMetadata = {
	name: string
	description: string | undefined
	image: CommonTokenContent | undefined
	animation: CommonTokenContent | undefined
	external: string | undefined
	attributes: TokenMetadataAttribute[]
}

export type CommonTokenContent = {
	url: string
	mimeType: string
	hash?: string
	fileSize?: number
	fileName?: string
	duration?: string
	dataRate?: {
		value: number
		unit: string
	}
	dimensions?: {
		value: string
		unit: string
	}
}

export type CommonTokenMetadataResponse = {
	name: string
	description: string | undefined
	image: string | undefined
	"animation_url": string | undefined
	"external_url": string | undefined
	attributes: TokenMetadataAttribute[]
}
