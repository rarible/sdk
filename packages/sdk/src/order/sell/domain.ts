import type { BigNumber } from "@rarible/types/build/big-number"
import type { OrderId } from "@rarible/api-client"
import type { CurrencyType } from "../../common/domain"
import { AbstractPrepareResponse } from "../../common/domain"
import { OrderRequest, PrepareOrderRequest } from "../common"

export interface PrepareSellResponse extends AbstractPrepareResponse<"approve" | "sign" | "send-tx", OrderRequest, OrderId> {
	/**
   * is multiple nft
   */
	multiple: boolean
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

export type ISell = (request: PrepareOrderRequest) => Promise<PrepareSellResponse>
