import { OrderId } from "@rarible/api-client"
import { BigNumberValue } from "@rarible/utils"
import { AbstractPrepareResponse, RequestCurrency } from "../../../common/domain"
import { MintRequest } from "../mint/mint-request.type"
import type { MintResponse } from "../mint/domain"
import type { UnionPart } from "../../order/common"
import { PrepareMintRequest } from "../mint/prepare-mint-request.type"

export type MintAndSellRequest = MintRequest & {
	/**
	 * Price per one NFT
	 */
	price: BigNumberValue
	/**
	 * Currency of the trade
	 */
	currency: RequestCurrency
	/**
	 * Origin fees, if not supported by the underlying contract, will throw Error
	 */
	originFees?: UnionPart[]
	/**
	 * Payouts, if not supported by the underlying contract, will throw Error
	 */
	payouts?: UnionPart[]
}

export type MintAndSellResponse = MintResponse & {
	orderId: OrderId
}

export type PrepareMintAndSellResponse =
	AbstractPrepareResponse<"mint" | "approve" | "sign" | "send-tx", MintAndSellRequest, MintAndSellResponse> & {
		multiple: boolean,
		supportsRoyalties: boolean
		supportsLazyMint: boolean
	}

export type IMintAndSell = (request: PrepareMintRequest) => Promise<PrepareMintAndSellResponse>
