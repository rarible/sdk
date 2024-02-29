import type { Address, Asset, AssetType, Erc1155LazyAssetType, Erc721LazyAssetType, OrderForm } from "@rarible/ethereum-api-client"

export type CheckLazyOrderPart = Pick<OrderForm, "make" | "take" | "maker">
export type CheckLazyAssetFn = (asset: Asset) => Promise<Asset>

export class CheckLazyOrderService {
	constructor(private readonly checkLazyAsset: CheckLazyAssetFn) {}

	check = async <T extends CheckLazyOrderPart>(form: T): Promise<T> => {
		const [make, take] = await Promise.all([
			this.checkMakeAsset(form.make, form.maker),
			this.checkLazyAsset(form.take),
		])

		return { ...form, make, take }
	}


	checkMakeAsset = async (asset: Asset, maker: Address): Promise<Asset> => {
		const make = await this.checkLazyAsset(asset)
		if (isLazyAsset(make.assetType)) {
			// @todo make sure this check is really needed
			if (make.assetType.creators[0].account === maker) {
				return make
			}
		}
		return asset
	}
}

function isLazyAsset(x: AssetType): x is Erc721LazyAssetType | Erc1155LazyAssetType {
	return x.assetClass === "ERC1155_LAZY" || x.assetClass === "ERC721_LAZY"
}
