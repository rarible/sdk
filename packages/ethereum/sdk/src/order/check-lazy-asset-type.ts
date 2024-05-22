import type { AssetType } from "@rarible/ethereum-api-client"
import type { RaribleEthereumApis } from "../common/apis"

export async function checkLazyAssetType(
  getApis: () => Promise<RaribleEthereumApis>,
  type: AssetType,
): Promise<AssetType> {
  const apis = await getApis()
  switch (type.assetClass) {
    case "ERC1155":
    case "ERC721": {
      const itemResponse = await apis.nftItem.getNftItemByIdRaw({ itemId: `${type.contract}:${type.tokenId}` })
      if (itemResponse.status === 200 && itemResponse.value.lazySupply === "0") {
        return type
      }
      const lazyResponse = await apis.nftItem.getNftLazyItemByIdRaw({ itemId: `${type.contract}:${type.tokenId}` })
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
          default:
            return type
        }
      }
      return type
    }
    default:
      return type
  }
}
