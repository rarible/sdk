import { ItemId } from "@rarible/api-client"
import { UnionAddress } from "@rarible/types"
import { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { AbstractPrepareResponse } from "../../common/domain"

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
	multiple: boolean,
}

export type ITransfer = (request: PrepareTransferRequest) => Promise<PrepareTransferResponse>
