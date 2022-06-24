import type { ItemId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { AbstractPrepareResponse } from "../../../common/domain"
import type { MetaUploadRequest, UploadMetaResponse } from "../../../sdk-blockchains/union/meta/domain"
import type { MintRequest } from "./mint-request.type"
import type { PrepareMintRequest } from "./prepare-mint-request.type"

type MintResponseCommon = {
	/**
	 * Identifier of the minted item
	 */
	itemId: ItemId
}

export enum MintType {
	OFF_CHAIN = "off-chain",
	ON_CHAIN = "on-chain"
}

export type OnChainMintResponse = MintResponseCommon & {
	type: MintType.ON_CHAIN
	transaction: IBlockchainTransaction
}

export type OffChainMintResponse = MintResponseCommon & {
	type: MintType.OFF_CHAIN
}

export type MintResponse = OnChainMintResponse | OffChainMintResponse

export interface PrepareMintResponse extends AbstractPrepareResponse<"mint", MintRequest, MintResponse>{
	multiple: boolean,
	supportsRoyalties: boolean
	supportsLazyMint: boolean
}

/**
 * Mint token
 * -
 * @param request
 * @returns {Promise<PrepareMintResponse>}
 * @example
 *
 * import { toUnionAddress } from "@rarible/types"
 *
 * const prepare = sdk.nft.mint({tokenId: toTokenId("ETHEREUM:0x...")})
 * const tx = prepare.submit({
 *		uri: "ipfs://..."
 *		supply: 1
 *		lazyMint: false
 *		creators?: [{account: toUnionAddress("ETHEREUM:0x..."), value: 100}]
 *		royalties?: [{account: toUnionAddress("ETHEREUM:0x..."), value: 100}]
 * })
 */
export type IMint = (request: PrepareMintRequest) => Promise<PrepareMintResponse>

/**
 * Upload meta data to nftStorage (for future minting)
 * @example
 * import { toUnionAddress } from "@rarible/types"
 * const sdk.nft.uploadMeta({
 * 		nftStorageApiKey: "your_nft_storage_api_key",
 *  	properties: {
 *  	 	name: string
 *			description?: string
 *			image?: File
 *			animationUrl?: File
 *			attributes: MintAttribute[]
 *  	},
 *  	accountAddress: toUnionAddress("ETHEREUM:0x...")
 *  })
 */
export type IUploadMeta = (request: MetaUploadRequest) => Promise<UploadMetaResponse>
