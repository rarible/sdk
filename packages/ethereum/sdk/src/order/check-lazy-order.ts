import type {
	UnionAddress,
	AssetType,
	EthErc1155LazyAssetType,
	EthErc721LazyAssetType,
	Asset,
	EthOrderFormAsset,
	OrderForm,
} from "@rarible/api-client"
import type { SimpleOrder } from "./types"
import { getAssetType } from "./get-asset-type"
import type { CheckLazyAsset } from "./check-lazy-asset"

export type CheckLazyOrderPart = Pick<SimpleOrder, "make" | "take" | "maker" | "data">
export type CheckLazyOrderType<T extends CheckLazyOrderPart | OrderForm> = (form: T) => Promise<T>

export async function checkLazyOrder<T extends CheckLazyOrderPart | OrderForm>(
	checkLazyAsset: CheckLazyAsset,
	form: T,
): Promise<T> {
	const make = await checkLazyMakeAsset(checkLazyAsset, form.make, form.maker)
	const take = await checkLazyAsset(form.take)
	return {
		...form,
		make,
		take,
	}
}

async function checkLazyMakeAsset<T extends Asset | EthOrderFormAsset>(
	checkLazyAsset: CheckLazyAsset,
	asset: T,
	maker: UnionAddress
): Promise<T> {
	const make = await checkLazyAsset(asset)
	const makeAssetType = getAssetType(make)
	if (isLazyAsset(makeAssetType) && makeAssetType.creators[0].account === maker) {
		return make as T
	}
	return asset
}

function isLazyAsset(x: AssetType): x is EthErc721LazyAssetType | EthErc1155LazyAssetType {
	return x["@type"] === "ERC1155_Lazy" || x["@type"] === "ERC721_Lazy"
}
