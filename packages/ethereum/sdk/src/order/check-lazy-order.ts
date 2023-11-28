import type { UnionAddress, AssetType, EthErc1155LazyAssetType, EthErc721LazyAssetType, OrderForm } from "@rarible/api-client"
import type { Asset } from "@rarible/api-client"
import type { SimpleOrder } from "./types"

// export type CheckLazyOrder = {
// 	make: Asset
// 	take: Asset
// 	maker: UnionAddress
// 	data: OrderData
// }
export type CheckLazyOrderPart = Pick<SimpleOrder, "make" | "take" | "maker" | "data">
export type CheckLazyOrderType<T extends CheckLazyOrderPart> = (form: T) => Promise<T>
export async function checkLazyOrder<T extends CheckLazyOrderPart>(
	checkLazyAsset: (asset: Asset) => Promise<Asset>,
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

async function checkLazyMakeAsset(
	checkLazyAsset: (asset: Asset) => Promise<Asset>,
	asset: Asset,
	maker: UnionAddress
): Promise<Asset> {
	const make = await checkLazyAsset(asset)
	if (isLazyAsset(make.type) && make.type.creators[0].account === maker) {
		return make
	}
	return asset
}

function isLazyAsset(x: AssetType): x is EthErc721LazyAssetType | EthErc1155LazyAssetType {
	return x["@type"] === "ERC1155_Lazy" || x["@type"] === "ERC721_Lazy"
}
