import type { Word } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import type { SimpleOrder } from "../order/types"

export const CURRENT_ORDER_TYPE_VERSION = "RARIBLE_V2"

export type HasOrder = { orderHash: Word } | { order: SimpleOrder }
export type HasPrice = { price: BigNumberValue } | { priceDecimal: BigNumberValue }
