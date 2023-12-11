import type { SimpleLegacyOrder } from "../types"
import { toLegacyAssetType } from "../to-legacy-asset-type"

export function toStructLegacyOrder(order: SimpleLegacyOrder) {
	if (order.data["@type"] !== "ETH_RARIBLE_V1") {
		throw new Error(`Not supported type: ${order.data["@type"]}`)
	}

	return {
		key: toStructLegacyOrderKey(order),
		selling: order.make.value,
		buying: order.take.value,
		sellerFee: order.data,
	}
}

export function toStructLegacyOrderKey(order: SimpleLegacyOrder) {
	return {
		owner: order.maker,
		salt: order.salt,
		sellAsset: toLegacyAssetType(order.make.type),
		buyAsset: toLegacyAssetType(order.take.type),
	}
}
