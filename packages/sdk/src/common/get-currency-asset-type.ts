import { toCurrencyId, ZERO_ADDRESS } from "@rarible/types"
import type * as ApiClient from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import { toBigNumber, toContractAddress } from "@rarible/types"
import { isEVMBlockchain } from "../sdk-blockchains/ethereum/common"
import type { RequestCurrency, RequestCurrencyAssetType } from "./domain"

export function getCurrencyAssetType(currency: RequestCurrency): RequestCurrencyAssetType {
	if (isRequestCurrencyAssetType(currency)) {
		return convertCurrencyIdToAssetType(currency)
	} else if (isAssetType(currency)) {
		return currency
	} else {
		throw new Error(`Unrecognized RequestCurrency ${JSON.stringify(currency)}`)
	}
}

export function isRequestCurrencyAssetType(x: RequestCurrency): x is ApiClient.CurrencyId {
	return typeof x === "string" && !!toCurrencyId(x)
}
export function isAssetType(x: RequestCurrency): x is RequestCurrencyAssetType {
	return typeof x === "object" && "@type" in x
}

export function convertCurrencyIdToAssetType(id: ApiClient.CurrencyId): RequestCurrencyAssetType {
	const [blockchain, address, tokenId] = id.split(":")
	if (isEVMBlockchain(blockchain)) {
		if (address === ZERO_ADDRESS) {
			return {
				"@type": "ETH",
				blockchain: blockchain,
			}
		}
		return {
			"@type": "ERC20",
			contract: toContractAddress(`${blockchain}:${address}`),
		}
	}
	if (blockchain === Blockchain.FLOW) {
		return {
			"@type": "FLOW_FT",
			contract: toContractAddress(id),
		}
	}
	if (blockchain === Blockchain.TEZOS) {
		if (id === XTZ) {
			return {
				"@type": "XTZ",
			}
		}
		return {
			"@type": "TEZOS_FT",
			contract: toContractAddress(`TEZOS:${address}`),
			tokenId: tokenId ? toBigNumber(tokenId) : undefined,
		}
	}
	throw new Error(`Unsupported currency type: ${id}`)
}

export const XTZ = "TEZOS:tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" as ApiClient.CurrencyId
