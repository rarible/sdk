import type { AssetType } from "@rarible/api-client"
import type * as ApiClient from "@rarible/api-client"
import { getItemIdData } from "@rarible/sdk-common"
import { createUnionItemId } from "../common/union-converters"

export async function checkLazyAssetType(
	itemApi: ApiClient.ItemControllerApi, chainId: number, type: AssetType
): Promise<AssetType> {
	switch (type["@type"]) {
		case "ERC1155":
		case "ERC721": {
			const itemResponse = await itemApi.getItemByIdRaw({
				itemId: createUnionItemId(chainId, type.contract, type.tokenId),
			})
			if (itemResponse.status === 200 && itemResponse.value.lazySupply === "0") {
				return type
			}
			const lazyResponse = await itemApi.getLazyItemByIdRaw({
				itemId: createUnionItemId(chainId, type.contract, type.tokenId),
			})
			if (lazyResponse.status === 200) {
				const lazy = lazyResponse.value
				const { contract, tokenId } = getItemIdData(lazy.id)
				switch (lazy["@type"]) {
					case "ETH_ERC721": {
						return {
							...lazy,
							"@type": "ERC721_Lazy",
							contract,
							tokenId,
						}
					}
					case "ETH_ERC1155": {
						return {
							...lazy,
							"@type": "ERC1155_Lazy",
							contract,
							tokenId,
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
