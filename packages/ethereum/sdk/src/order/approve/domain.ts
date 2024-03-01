
import type { AssetType } from "@rarible/ethereum-api-client"
import type { AssetTypeByClass } from "../../common/asset-types/domain"
import type { ApproveHandler } from "./base"

// @todo add satisfies to AssetClass[] once ts5 migrated
export const approvableAssetTypes = [
	"ERC20",
	"ERC721",
	"ERC1155",
	"ERC721_LAZY",
	"ERC1155_LAZY",
	"CRYPTO_PUNKS",
] as const


export type ApprovableAssetType = typeof approvableAssetTypes[number]

export type ApproveHandlers = {
	[K in ApprovableAssetType]: ApproveHandler<K>
}

export function isApprovableAsset(x: AssetType): x is AssetTypeByClass<ApprovableAssetType> {
	return approvableAssetTypes.includes(x.assetClass as ApprovableAssetType)
}