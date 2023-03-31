import type { Address, AssetType, BigNumber } from "@rarible/ethereum-api-client"
import { toBigNumber, ZERO_ADDRESS } from "@rarible/types"

type LegacyAssetType = {
	token: Address
	tokenId: BigNumber,
	assetType: number
}

export function toLegacyAssetType(assetType: AssetType): LegacyAssetType {
	switch (assetType.assetClass) {
		case "ETH":
			return {
				token: ZERO_ADDRESS,
				tokenId: toBigNumber("0"),
				assetType: 0,
			}
		case "ERC20":
			return {
				token: assetType.contract,
				tokenId: toBigNumber("0"),
				assetType: 1,
			}
		case "ERC721":
			return {
				token: assetType.contract,
				tokenId: assetType.tokenId,
				assetType: 3,
			}
		case "ERC1155":
			return {
				token: assetType.contract,
				tokenId: assetType.tokenId,
				assetType: 2,
			}
		default: {
			throw new Error("Unsupported")
		}
	}
}
