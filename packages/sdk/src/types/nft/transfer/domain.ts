import type { ItemId } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { BigNumber } from "@rarible/types/build/big-number"
import type { AbstractPrepareResponse } from "../../../common/domain"

export type PrepareTransferRequest = {
	/**
   * Identifier of the minted item
   */
	itemId: ItemId
}

export interface TransferRequest {
	/*
  * Recipient NFT address
   */
	to: UnionAddress

	/**
   * Number of NFTs to transfer
   */
	amount?: number
}

export interface PrepareTransferResponse extends AbstractPrepareResponse<"transfer", TransferRequest, IBlockchainTransaction>{
	/**
   * Is supports multiple values
   */
	multiple: boolean

	/**
   * Maximum amount to transfer NFT
   */
	maxAmount: BigNumber
}

export type ITransfer = (request: PrepareTransferRequest) => Promise<PrepareTransferResponse>
