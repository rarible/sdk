import type { UnionAddress, AssetType, EthErc1155LazyAssetType, EthErc721LazyAssetType, OrderForm } from "@rarible/api-client"
import type { EthOrderFormAsset } from "@rarible/api-client/build/models/EthOrderFormAsset"

export type CheckLazyOrderPart = Pick<OrderForm, "make" | "take" | "maker" | "data">

export async function checkLazyOrder(
	checkLazyAsset: (asset: EthOrderFormAsset) => Promise<EthOrderFormAsset>,
	form: CheckLazyOrderPart,
): Promise<CheckLazyOrderPart> {
	const make = await checkLazyMakeAsset(checkLazyAsset, form.make, form.maker)
	const take = await checkLazyAsset(form.take)
	return {
		...form,
		make,
		take,
	}
}

async function checkLazyMakeAsset(
	checkLazyAsset: (asset: EthOrderFormAsset) => Promise<EthOrderFormAsset>,
	asset: EthOrderFormAsset,
	maker: UnionAddress
): Promise<EthOrderFormAsset> {
	const make = await checkLazyAsset(asset)
	if (isLazyAsset(make.assetType) && make.assetType.creators[0].account === maker) {
		return make
	}
	return asset
}

function isLazyAsset(x: AssetType): x is EthErc721LazyAssetType | EthErc1155LazyAssetType {
	return x["@type"] === "ERC1155_Lazy" || x["@type"] === "ERC721_Lazy"
}
