import type { BigNumber, EVMAddress } from "@rarible/types"

export interface Erc721AssetRequest {
  assetClass: "ERC721"
  contract: EVMAddress
  tokenId: BigNumber
}

export type TransferRequest = Erc721AssetRequest & {
  to: EVMAddress
}

export type TransferResponse = {
  status: "success"
  txId: number
}
