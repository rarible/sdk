import type * as ApiClient from "@rarible/api-client"
import type { TezosMetadataResponse } from "../../../sdk-blockchains/tezos/common"
import type { UnionPart } from "../../order/common"

export type IPreprocessMeta = (meta: PreprocessMetaRequest) => PreprocessMetaResponse

export type PreprocessMetaRequest =
  { blockchain: ApiClient.Blockchain } & CommonTokenMetadata
export type PreprocessMetaResponse = CommonTokenMetadataResponse | TezosMetadataResponse

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
	royalties?: UnionPart[]
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
