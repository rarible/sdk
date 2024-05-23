import type { Blockchain } from "@rarible/api-client"
import type { TezosMetadataResponse } from "../../../sdk-blockchains/tezos/common"
import type { ISolanaMetadataResponse, ISolanaTokenMetadata } from "../../../sdk-blockchains/solana/domain"
import type { AptosTokenMetadata } from "../../../sdk-blockchains/aptos/domain"

/**
 * Prepare meta data before upload to ipfs storage
 * @param meta - metadata request for prepare
 * @returns {PreprocessMetaResponse}
 *
 * @example
 *
 * const prepared = sdk.nft.preprocessMeta({
 *   name: "Test",
 *   description: "Test",
 *   image: {File},
 *   animation: {File},
 *   external: "http://",
 *   attributes: [{key: "test", value: "test"}]
 * })
 */
export type IPreprocessMeta = (meta: PreprocessMetaRequest) => PreprocessMetaResponse
/**
 * @property name -
 * @property {string | undefined} description
 * @property {CommonTokenContent | undefined} image
 * @property {CommonTokenContent | undefined} animation
 * @property {string | undefined} external
 * @property {TokenMetadataAttribute[]} attributes
 */
export type PreprocessMetaRequest = GeneralMetaRequest | SolanaMetaRequest | AptosMetaRequest

export type GeneralMetaRequest = {
  blockchain: Blockchain.ETHEREUM | Blockchain.POLYGON | Blockchain.TEZOS | Blockchain.FLOW
} & CommonTokenMetadata

export type SolanaMetaRequest = {
  blockchain: Blockchain.SOLANA
} & ISolanaTokenMetadata

export type AptosMetaRequest = {
  blockchain: Blockchain.APTOS
} & AptosTokenMetadata

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
  animation_url: string | undefined
  external_url: string | undefined
  attributes: TokenMetadataAttribute[]
}
