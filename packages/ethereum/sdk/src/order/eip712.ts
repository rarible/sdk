export const EIP712_ORDER_NAME = "Exchange"

export const EIP712_ORDER_VERSION = "2"

export const EIP712_ORDER_TYPE = "Order"

export const EIP712_DOMAIN_TEMPLATE = {
	name: EIP712_ORDER_NAME,
	version: EIP712_ORDER_VERSION,
}

export const EIP712_ORDER_TYPES = {
	EIP712Domain: [
		{ type: "string", name: "name" },
		{ type: "string", name: "version" },
		{ type: "uint256", name: "chainId" },
		{ type: "address", name: "verifyingContract" },
	],
	AssetType: [
		{ name: "assetClass", type: "bytes4" },
		{ name: "data", type: "bytes" },
	],
	Asset: [
		{ name: "assetType", type: "AssetType" },
		{ name: "value", type: "uint256" },
	],
	Order: [
		{ name: "maker", type: "address" },
		{ name: "makeAsset", type: "Asset" },
		{ name: "taker", type: "address" },
		{ name: "takeAsset", type: "Asset" },
		{ name: "salt", type: "uint256" },
		{ name: "start", type: "uint256" },
		{ name: "end", type: "uint256" },
		{ name: "dataType", type: "bytes4" },
		{ name: "data", type: "bytes" },
	],
}
