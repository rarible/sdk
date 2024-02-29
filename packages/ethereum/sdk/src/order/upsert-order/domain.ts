import type { Order, OrderForm, Part } from "@rarible/ethereum-api-client"
import type { Action } from "@rarible/action"
import type { Address, Word } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import type { SimpleOrder } from "../types"

export type UpsertOrderStageId = "approve" | "sign"
export type UpsertOrderActionArg = {
	order: OrderForm
	infinite?: boolean
}
export type UpsertOrderAction = Action<UpsertOrderStageId, UpsertOrderActionArg, Order>

export type HasOrder = { orderHash: Word } | { order: SimpleOrder }
export type HasPrice = { price: BigNumberValue } | { priceDecimal: BigNumberValue }

export enum OrderRequestEnum {
	DATA_V2 = "DATA_V2",
	DATA_V3_SELL = "DATA_V3_SELL",
	DATA_V3_BUY = "DATA_V3_BUY",
}

export type OrderRequestV2 = {
	type: OrderRequestEnum.DATA_V2
	maker?: Address
	payouts: Part[]
	originFees: Part[]
	start?: number
	end: number
}

export type OrderRequestV3Sell = {
	type: OrderRequestEnum.DATA_V3_SELL
	maker?: Address
	payout: Part
	originFeeFirst?: Part
	originFeeSecond?: Part
	maxFeesBasePoint: number
	start?: number
	end: number
}

export type OrderRequestV3Buy = {
	type: OrderRequestEnum.DATA_V3_BUY
	maker?: Address
	payout?: Part
	originFeeFirst?: Part
	originFeeSecond?: Part
	start?: number
	end: number
}

export type OrderRequest<T extends OrderRequestEnum = OrderRequestEnum> = {
	[OrderRequestEnum.DATA_V2]: OrderRequestV2
	[OrderRequestEnum.DATA_V3_BUY]: OrderRequestV3Buy
	[OrderRequestEnum.DATA_V3_SELL]: OrderRequestV3Sell
}[T]
