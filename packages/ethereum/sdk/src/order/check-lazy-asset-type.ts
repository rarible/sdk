import type { AssetType } from "@rarible/ethereum-api-client"
import type * as ApiClient from "@rarible/api-client"

export async function checkLazyAssetType(itemApi: ApiClient.ItemControllerApi, type: AssetType): Promise<AssetType> {
	switch (type.assetClass) {
		case "ERC1155":
		case "ERC721": {
			const itemResponse = await itemApi.getNftItemByIdRaw({ itemId: `${type.contract}:${type.tokenId}` })
			if (itemResponse.status === 200 && itemResponse.value.lazySupply === "0") {
				return type
			}
			const lazyResponse = await itemApi.getNftLazyItemByIdRaw({ itemId: `${type.contract}:${type.tokenId}` })
			if (lazyResponse.status === 200) {
				const lazy = lazyResponse.value
				switch (lazy["@type"]) {
					case "ERC721": {
						return {
							...lazy,
							assetClass: "ERC721_LAZY",
						}
					}
					case "ERC1155": {
						return {
							...lazy,
							assetClass: "ERC1155_LAZY",
						}
					}
					default: return type
				}
			}
			return type
		}
		default: return type
	}
}
