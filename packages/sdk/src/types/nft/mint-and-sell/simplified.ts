import type { OrderId } from "@rarible/api-client"
import type { MintSimplifiedRequestOffChain, MintSimplifiedRequestOnChain } from "../mint/simplified"
import type { OrderRequest } from "../../order/common"
import type { OffChainMintResponse, OnChainMintResponse } from "../mint/prepare"

export interface IMintAndSellSimplified {
  mintAndSell(request: MintAndSellBasicRequestOnChain): Promise<MintAndSellBasicResponseOnChain>
  mintAndSell(request: MintAndSellBasicRequestOffChain): Promise<MintAndSellBasicResponseOffChain>
}

export type MintAndSellBasicRequestOnChain = MintSimplifiedRequestOnChain & OrderRequest
export type MintAndSellBasicRequestOffChain = MintSimplifiedRequestOffChain & OrderRequest
export type MintAndSellBasicResponseOnChain = OnChainMintResponse & { orderId: OrderId }
export type MintAndSellBasicResponseOffChain = OffChainMintResponse & { orderId: OrderId }
