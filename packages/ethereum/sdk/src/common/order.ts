import type { OrderData } from "@rarible/api-client/build/models/OrderData"
import type { EthRaribleV2OrderData } from "@rarible/api-client/build/models/OrderData"

export const CURRENT_ORDER_TYPE_VERSION = "RARIBLE_V2"

const V2_ORDER_TYPES = [
	"ETH_RARIBLE_V2",
	"ETH_RARIBLE_V2_2",
	"ETH_RARIBLE_V2_DATA_V3_SELL",
	"ETH_RARIBLE_V2_DATA_V3_BUY",
] as const
export function isOrderV2(data: OrderData): data is EthRaribleV2OrderData {
	return V2_ORDER_TYPES.some(type => type === data["@type"])
}
