import { Address, toAddress, toOrderId, UnionAddress, Word } from "@rarible/types"
import { isBlockchainSpecified } from "@rarible/types/build/blockchains"
import { OrderId } from "@rarible/api-client"
import { CurrencyType, RequestCurrency } from "../../../common/domain"

export function getEthTakeAssetType(currency: RequestCurrency) {
	switch (currency["@type"]) {
		case "ERC20": {
			return {
				assetClass: currency["@type"],
				contract: convertUnionToEthereumAddress(currency.contract),
			}
		}
		case "ETH": {
			return {
				assetClass: currency["@type"],
			}
		}
		default: {
			throw Error("Invalid take asset type")
		}
	}
}

export function getSupportedCurrencies(): CurrencyType[] {
	return [
		{ blockchain: "ETHEREUM", type: "NATIVE" },
		{ blockchain: "ETHEREUM", type: "ERC20" },
	]
}

export function convertUnionToEthereumAddress(unionAddress: UnionAddress): Address {
	if (!isBlockchainSpecified(unionAddress)) {
		throw new Error("Not a UnionAddress: " + unionAddress)
	}

	const [, address] = unionAddress.split(":")
	return toAddress(address)
}

export function convertOrderHashToOrderId(hash: Word): OrderId {
	return toOrderId(`ETHEREUM:${hash}`)
}
