import { BigNumber } from "@rarible/types/build/big-number"
import { Order } from "@rarible/api-client"
import { AbstractPrepareResponse, CurrencyType } from "../../common/domain"
import { OrderRequest, PrepareOrderRequest } from "../common"

//todo use the same type as PrepareSellResponse. multiple is not needed
export interface PrepareBidResponse extends AbstractPrepareResponse<"approve" | "sign", OrderRequest, Order> {
	/**
   * currencies supported by the blockchain
   */
	supportedCurrencies: CurrencyType[]
	/**
   * Max amount to sell (how many user owns and can sell). If 1, then input not needed
   */
	maxAmount: BigNumber
	/**
   * protocol base fee in basis points
   */
	baseFee: number
}

export type IBid = (request: PrepareOrderRequest) => Promise<PrepareBidResponse>
