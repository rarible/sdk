import type { Order } from "@rarible/api-client/build/models/Order"
import type { OrderData } from "@rarible/api-client/build/models/OrderData"
import type {
	EthLooksRareOrderDataV1, EthLooksRareOrderDataV2,
	EthOrderCryptoPunksData,
	EthOrderDataLegacy,
	EthOrderOpenSeaV1DataV1, EthOrderSeaportDataV1,
	EthRaribleV2OrderData, EthSudoSwapAmmDataV1, EthX2Y2OrderDataV1,
} from "@rarible/api-client/build/models/OrderData"
export type SimpleGenericOrder<T extends OrderData> = Pick<Order, "maker" | "taker" | "make" | "take" | "salt" | "startedAt" | "endedAt" | "signature"> & { data: T }

export type SimpleLegacyOrder = SimpleGenericOrder<EthOrderDataLegacy>
export type SimpleRaribleV2Order = SimpleGenericOrder<EthRaribleV2OrderData>
export type SimpleOpenSeaV1Order = SimpleGenericOrder<EthOrderOpenSeaV1DataV1>
export type SimpleCryptoPunkOrder = SimpleGenericOrder<EthOrderCryptoPunksData>
export type SimpleSeaportV1Order = SimpleGenericOrder<EthOrderSeaportDataV1>
export type SimpleLooksrareOrder = SimpleGenericOrder<EthLooksRareOrderDataV1>
export type SimpleLooksrareV2Order = SimpleGenericOrder<EthLooksRareOrderDataV2>
export type SimpleX2Y2Order = SimpleGenericOrder<EthX2Y2OrderDataV1>
export type SimpleAmmOrder = SimpleGenericOrder<EthSudoSwapAmmDataV1>

export type SimpleOrder =
	SimpleLegacyOrder |
	SimpleRaribleV2Order |
	SimpleOpenSeaV1Order |
	SimpleCryptoPunkOrder |
	SimpleSeaportV1Order |
	SimpleLooksrareOrder |
	SimpleLooksrareV2Order |
	SimpleX2Y2Order |
	SimpleAmmOrder

export type UpsertSimpleOrder =
	SimpleLegacyOrder |
	SimpleRaribleV2Order
