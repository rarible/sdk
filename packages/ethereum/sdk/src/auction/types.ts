import type { Action } from "@rarible/action"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import type { Erc20AssetType, EthAssetType, Part } from "@rarible/ethereum-api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { AssetTypeRequest } from "../order/check-asset-type"

export type CreateAuctionRequest = {
  makeAssetType: AssetTypeRequest
  amount: BigNumber
  takeAssetType: EthAssetType | Erc20AssetType
  minimalStepDecimal: BigNumberValue
  minimalPriceDecimal: BigNumberValue
  duration: number
  startTime?: number
  buyOutPriceDecimal: BigNumberValue
  originFees?: Part[]
}

export type AuctionStartAction = Action<"approve" | "sign", CreateAuctionRequest, AuctionStartResponse>
export type AuctionStartResponse = {
  tx: EthereumTransaction
  hash: Promise<string>
  auctionId: Promise<BigNumber>
}

export type PutBidRequest = {
  hash: string
  priceDecimal: BigNumber
  originFees?: Part[]
}
export type PutAuctionBidAction = Action<"approve" | "sign", PutBidRequest, EthereumTransaction>

export type BuyOutRequest = {
  hash: string
  originFees?: Part[]
}
export type BuyoutAuctionAction = Action<"approve" | "sign", BuyOutRequest, EthereumTransaction>
