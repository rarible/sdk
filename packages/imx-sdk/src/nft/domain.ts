import type { Address } from "@rarible/ethereum-api-client"
import type { BigNumber } from "@rarible/types"

export interface Erc721AssetRequest {
	assetClass: "ERC721"
	contract: Address
	tokenId: BigNumber
}

export type TransferRequest = Erc721AssetRequest & {
	to: Address
}

export type TransferResponse = {
	status: "success"
	txId: number
}
