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
   * Number of NFTs to burn
   */
  amount?: number
  /**
   * Item creators
   */
  creators?: Creator[]
} | void

export type BurnResponse = IBlockchainTransaction | void

export interface PrepareBurnResponse extends AbstractPrepareResponse<"burn", BurnRequest, BurnResponse> {
  /**
   * Is supports multiple values
   */
  multiple: boolean

  /**
   * Maximum amount to burn
   */
  maxAmount: BigNumber
}

/**
 * Burn token
 * -
 * @param request
 * @returns promise of {@link PrepareBurnResponse>}
 */
export type IBurnPrepare = (request: PrepareBurnRequest) => Promise<PrepareBurnResponse>
