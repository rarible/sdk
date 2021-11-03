import { ItemId } from "@rarible/api-client"
import { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BigNumber } from "@rarible/types/build/big-number"
import { AbstractPrepareResponse } from "../../../common/domain"

export type PrepareBurnRequest = {
	itemId: ItemId
}

export type BurnRequest = {
	/**
   * Number of NFTs to transfer
   */
	amount?: number
} | void

export interface PrepareBurnResponse extends AbstractPrepareResponse<"burn", BurnRequest, IBlockchainTransaction>{
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
