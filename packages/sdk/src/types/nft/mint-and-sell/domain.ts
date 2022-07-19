import type { OrderId } from "@rarible/api-client"
import type { MintRequest } from "../mint/mint-request.type"
import type { MintResponse } from "../mint/prepare"
import type { PrepareMintRequest } from "../mint/prepare-mint-request.type"
import type { OriginFeeSupport, PayoutsSupport } from "../../order/fill/domain"
import type { AbstractPrepareResponse, CurrencyType } from "../../../common/domain"
import type { OrderRequest } from "../../order/common"

export type MintAndSellRequest = MintRequest & Omit<OrderRequest, "amount">

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

export type IMintAndSellPrepare = (request: PrepareMintRequest) => Promise<PrepareMintAndSellResponse>
