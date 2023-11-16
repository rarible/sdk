import type { AssetType } from "@rarible/api-client"
import type { Address, BigNumber } from "@rarible/types"
import { toBigNumber, ZERO_ADDRESS } from "@rarible/types"
import { convertToEVMAddress } from "@rarible/sdk-common"

type LegacyAssetType = {
	token: Address
	tokenId: BigNumber,
	assetType: number
}

export function toLegacyAssetType(assetType: AssetType): LegacyAssetType {
	switch (assetType["@type"]) {
		case "ETH":
			return {
				token: ZERO_ADDRESS,
				tokenId: toBigNumber("0"),
				assetType: 0,
			}
		case "ERC20":
			return {
				token: convertToEVMAddress(assetType.contract),
				tokenId: toBigNumber("0"),
				assetType: 1,
			}
		case "ERC721":
			return {
				token: convertToEVMAddress(assetType.contract),
				tokenId: assetType.tokenId,
				assetType: 3,
			}
		case "ERC1155":
			return {
				token: convertToEVMAddress(assetType.contract),
				tokenId: assetType.tokenId,
				assetType: 2,
			}
		default: {
			throw new Error("Unsupported")
		}
	}
}
