import { toBigNumber, toContractAddress, toCurrencyId, toItemId, ZERO_ADDRESS } from "@rarible/types"
import type * as ApiClient from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { AssetType, EthErc20AssetType, EthEthereumAssetType } from "@rarible/api-client/build/models/AssetType"
import { isEVMBlockchain } from "@rarible/sdk-common"
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

export function getEVMCurrencyId(
	currency: ApiClient.EthErc20AssetType | ApiClient.EthEthereumAssetType,
): ApiClient.CurrencyId {
	if (isRequestCurrencyAssetType(currency)) {
		return currency
	} else if (isAssetType(currency)) {
		return convertEVMAssetTypeToCurrencyId(currency)
	} else {
		throw new Error(`Unrecognized RequestCurrency ${JSON.stringify(currency)}`)
	}
}

export function isRequestCurrencyAssetType(x: RequestCurrency): x is ApiClient.CurrencyId {
	return typeof x === "string" && !!toCurrencyId(x)
}
export function isAssetType(x: RequestCurrency): x is RequestCurrencyAssetType {
	return typeof x === "object" && x !== null  && "@type" in x
}

export function isEth(x: AssetType): x is EthEthereumAssetType {
	return x["@type"] === "ETH"
}

export function isErc20(x: AssetType): x is EthErc20AssetType {
	return x["@type"] === "ERC20"
}

export function convertEVMAssetTypeToCurrencyId(
	id: RequestCurrencyAssetType,
): ApiClient.CurrencyId {
	if (isEth(id)) {
		return toCurrencyId(`${id.blockchain || Blockchain.ETHEREUM}:${ZERO_ADDRESS}`)
	}
	if (isErc20(id)) {
		return toCurrencyId(id.contract)
	}
	throw new Error(`Unsupported currency type: ${id}`)
}

export function convertCurrencyIdToAssetType(id: ApiClient.CurrencyId): RequestCurrencyAssetType {
	const { blockchain, contract, tokenId } = getDataFromCurrencyId(id)
	if (isEVMBlockchain(blockchain) || blockchain === Blockchain.IMMUTABLEX) {
		if (contract === ZERO_ADDRESS) {
			return {
				"@type": "ETH",
				blockchain: blockchain,
			}
		}
		return {
			"@type": "ERC20",
			contract: toContractAddress(`${blockchain}:${contract}`),
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
			contract: toContractAddress(`TEZOS:${contract}`),
			tokenId: tokenId ? toBigNumber(tokenId) : undefined,
		}
	}
	if (blockchain === Blockchain.SOLANA) {
		if (contract === ZERO_ADDRESS) {
			return {
				"@type": "SOLANA_SOL",
			}
		}
		return {
			"@type": "SOLANA_NFT",
			itemId: toItemId("SOLANA:" + contract),
		}
	}
	throw new Error(`Unsupported currency type: ${id}`)
}

export function getDataFromCurrencyId(id: ApiClient.CurrencyId) {
	const [blockchain, contract, tokenId] = id.split(":")
	if (!(blockchain in Blockchain)) {
		throw new Error(`Unsupported blockchain: ${id}`)
	}
	return {
		blockchain: blockchain as Blockchain,
		contract,
		tokenId,
	}
}

export const XTZ = "TEZOS:tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" as ApiClient.CurrencyId
