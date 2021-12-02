import type * as ApiClient from "@rarible/api-client"
import type { TezosMetadataResponse } from "../../../sdk-blockchains/tezos/common"

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
	image: string | undefined
	animationUrl: string | undefined
	externalUrl: string | undefined
	attributes: TokenMetadataAttribute[]
}

export type CommonTokenMetadataResponse = {
	name: string
	description: string | undefined
	image: string | undefined
	// eslint-disable-next-line camelcase
	animation_url: string | undefined
	// eslint-disable-next-line camelcase
	external_url: string | undefined
	attributes: TokenMetadataAttribute[]
}
