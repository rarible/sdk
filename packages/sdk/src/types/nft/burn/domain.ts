import type { ItemId } from "@rarible/api-client"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { BigNumber } from "@rarible/types/build/big-number"
import type { Creator } from "@rarible/api-client/build/models/Creator"
import type { AbstractPrepareResponse } from "../../../common/domain"

export type PrepareBurnRequest = {
	itemId: ItemId
}

export type BurnRequest = {
	/**
   * Number of NFTs to transfer
   */
	amount?: number
	/**
   * Item creators
   */
	creators?: Creator[]
} | void

export interface PrepareBurnResponse extends AbstractPrepareResponse<"burn", BurnRequest, IBlockchainTransaction | void>{
	/**
   * Is supports multiple values
   */
	multiple: boolean

	/**
   * Maximum amount to burn
   */
	maxAmount: BigNumber
}

export type IBurn = (request: PrepareBurnRequest) => Promise<PrepareBurnResponse>
