import type { OrderId } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { MintRequest } from "../mint/mint-request.type"
import type { MintResponse } from "../mint/domain"
import type { UnionPart } from "../../order/common"
import type { PrepareMintRequest } from "../mint/prepare-mint-request.type"
import type { OriginFeeSupport, PayoutsSupport } from "../../order/fill/domain"
import type { AbstractPrepareResponse, CurrencyType, RequestCurrency } from "../../../common/domain"

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
	/**
   * Order expiration date
   */
	expirationDate?: Date
}

export type MintAndSellResponse = MintResponse & {
	orderId: OrderId
}

export type PrepareMintAndSellResponse =
	AbstractPrepareResponse<"mint" | "convert" | "approve" | "sign" | "send-tx", MintAndSellRequest, MintAndSellResponse> & {
		supportedCurrencies: CurrencyType[]
		baseFee: number
		originFeeSupport: OriginFeeSupport
		payoutsSupport: PayoutsSupport
		supportsRoyalties: boolean
		supportsLazyMint: boolean
	}

export type IMintAndSell = (request: PrepareMintRequest) => Promise<PrepareMintAndSellResponse>
