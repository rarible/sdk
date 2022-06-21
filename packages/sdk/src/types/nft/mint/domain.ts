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

export type IMint = (request: PrepareMintRequest) => Promise<PrepareMintResponse>

export type IUploadMeta = (request: MetaUploadRequest) => Promise<UploadMetaResponse>
