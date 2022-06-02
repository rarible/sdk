import type { OrderId } from "@rarible/api-client"
import type { MintSimplifiedRequestOffChain, MintSimplifiedRequestOnChain } from "../mint/simplified"
import type { OrderRequest } from "../../order/common"
import type { OffChainMintResponse, OnChainMintResponse } from "../mint/domain"

export interface IMintAndSellSimplified {
	mintAndSellStart(request: MintAndSellSimplifiedRequestOnChain): Promise<MintAndSellSimplifiedResponseOnChain>
	mintAndSellStart(request: MintAndSellSimplifiedRequestOffChain): Promise<MintAndSellSimplifiedResponseOffChain>
}

export type MintAndSellSimplifiedRequestOnChain = MintSimplifiedRequestOnChain & Omit<OrderRequest, "amount">
export type MintAndSellSimplifiedRequestOffChain = MintSimplifiedRequestOffChain & Omit<OrderRequest, "amount">
export type MintAndSellSimplifiedResponseOnChain = OnChainMintResponse & { orderId: OrderId }
export type MintAndSellSimplifiedResponseOffChain = OffChainMintResponse & { orderId: OrderId }
