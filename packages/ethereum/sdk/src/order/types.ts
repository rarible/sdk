import type { Order } from "@rarible/api-client/build/models/Order"
import type {
	EthLooksRareOrderDataV1, EthLooksRareOrderDataV2,
	EthOrderCryptoPunksData,
	EthOrderDataLegacy,
	EthOrderOpenSeaV1DataV1, EthOrderSeaportDataV1,
	EthSudoSwapAmmDataV1, EthX2Y2OrderDataV1,
} from "@rarible/api-client/build/models/OrderData"
import type {
	EthOrderDataRaribleV2DataV1,
	EthOrderDataRaribleV2DataV2,
	EthOrderDataRaribleV2DataV3Buy, EthOrderDataRaribleV2DataV3Sell,
} from "@rarible/api-client/build/models/OrderData"

export type SimpleGenericOrder = Pick<Order, "maker" | "taker" | "make" | "take" | "salt" | "startedAt" | "endedAt" | "signature">

export type SimpleLegacyOrder = SimpleGenericOrder & { data: EthOrderDataLegacy }

export type SimpleRaribleV2DataV1Order = SimpleGenericOrder & { data: EthOrderDataRaribleV2DataV1 }
export type SimpleRaribleV2DataV2Order = SimpleGenericOrder & { data: EthOrderDataRaribleV2DataV2 }
export type SimpleRaribleV2DataV3SellOrder = SimpleGenericOrder & { data: EthOrderDataRaribleV2DataV3Sell }
export type SimpleRaribleV2DataV3BuyOrder = SimpleGenericOrder & { data: EthOrderDataRaribleV2DataV3Buy }
export type SimpleRaribleV2Order =
  SimpleRaribleV2DataV1Order |
  SimpleRaribleV2DataV2Order |
  SimpleRaribleV2DataV3SellOrder |
  SimpleRaribleV2DataV3BuyOrder

export type SimpleOpenSeaV1Order = SimpleGenericOrder & { data: EthOrderOpenSeaV1DataV1 }
export type SimpleCryptoPunkOrder = SimpleGenericOrder & { data: EthOrderCryptoPunksData }
export type SimpleSeaportV1Order = SimpleGenericOrder & { data: EthOrderSeaportDataV1 }
export type SimpleLooksrareOrder = SimpleGenericOrder & { data: EthLooksRareOrderDataV1 }
export type SimpleLooksrareV2Order = SimpleGenericOrder & { data: EthLooksRareOrderDataV2 }
export type SimpleX2Y2Order = SimpleGenericOrder & { data: EthX2Y2OrderDataV1 }
export type SimpleAmmOrder = SimpleGenericOrder & { data: EthSudoSwapAmmDataV1 }

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
