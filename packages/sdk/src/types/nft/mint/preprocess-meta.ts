import type * as ApiClient from "@rarible/api-client"
import type { TezosMeta } from "../../../sdk-blockchains/tezos/common"

export type PreprocessMetaResponse = CommonTokenMetadata | TezosMeta

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

export type PreprocessMetaRequest =
  { blockchain: ApiClient.Blockchain } & CommonTokenMetadata

export type IPreprocessMeta = (meta: PreprocessMetaRequest) => PreprocessMetaResponse
