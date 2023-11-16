import type { Ethereum } from "@rarible/ethereum-provider"
import { keccak256 } from "ethereumjs-util"
import { convertToEVMAddress } from "@rarible/sdk-common"
import { toLegacyAssetType } from "./to-legacy-asset-type"
import type { SimpleOrder } from "./types"

export function hashLegacyOrder(ethereum: Ethereum, order: SimpleOrder): string {
	const data = order.data
	if (data["@type"] !== "ETH_RARIBLE_V1") {
		throw new Error(`Not supported data type: ${data["@type"]}`)
	}

	const makeType = toLegacyAssetType(order.make.type)
	const takeType = toLegacyAssetType(order.take.type)

	const struct = {
		key: {
			owner: convertToEVMAddress(order.maker),
			salt: order.salt,
			sellAsset: makeType,
			buyAsset: takeType,
		},
		selling: order.make.value,
		buying: order.take.value,
		sellerFee: data.fee,
	}
	const encodedOrder = ethereum.encodeParameter({ Order: ORDER }, struct)
	return `0x${keccak256(Buffer.from(encodedOrder.substring(2), "hex")).toString("hex")}`
}

const ASSET = {
	token: "address",
	tokenId: "uint256",
	assetType: "uint8",
}

const ORDER = {
	key: {
		owner: "address",
		salt: "uint256",
		sellAsset: ASSET,
		buyAsset: ASSET,
	},
	selling: "uint256",
	buying: "uint256",
	sellerFee: "uint256",
}
