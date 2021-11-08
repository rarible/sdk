import type { Address, UnionAddress, Word } from "@rarible/types"
import { toAddress, toOrderId } from "@rarible/types"
import { isBlockchainSpecified } from "@rarible/types/build/blockchains"
import type { OrderId } from "@rarible/api-client"
import type { UnionPart } from "packages/sdk/src/types/order/common"
import type { Part } from "@rarible/ethereum-api-client"
import type { CurrencyType, RequestCurrency } from "../../../common/domain"

export function getEthTakeAssetType(currency: RequestCurrency) {
	switch (currency["@type"]) {
		case "ERC20":
			return {
				assetClass: currency["@type"],
				contract: convertUnionToEthereumAddress(currency.contract),
			}
		case "ETH":
			return {
				assetClass: currency["@type"],
			}
		default:
			throw new Error("Invalid take asset type")
	}
}

export function toEthereumParts(parts: UnionPart[] | undefined): Part[] {
	return parts?.map((fee) => ({
		account: convertUnionToEthereumAddress(fee.account),
		value: fee.value,
	})) || []
}

export function getSupportedCurrencies(): CurrencyType[] {
	return [
		{ blockchain: "ETHEREUM", type: "NATIVE" },
		{ blockchain: "ETHEREUM", type: "ERC20" },
	]
}

export function convertUnionToEthereumAddress(
	unionAddress: UnionAddress
): Address {
	if (!isBlockchainSpecified(unionAddress)) {
		throw new Error("Not a UnionAddress: " + unionAddress)
	}

	const [, address] = unionAddress.split(":")
	return toAddress(address)
}

export function convertOrderHashToOrderId(hash: Word): OrderId {
	return toOrderId(`ETHEREUM:${hash}`)
}
