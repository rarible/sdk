import {
	Blockchain,
	EthErc20AssetType,
	EthEthereumAssetType,
	TezosXTZAssetType,
	FlowAssetTypeFt
} from "@rarible/api-client"
import { toContractAddress } from "@rarible/types"
import { CurrencyType, RequestCurrency } from "@rarible/sdk/build/common/domain"

function getEthNative(blockchain: Blockchain): EthEthereumAssetType {
	return {
		"@type": "ETH",
		blockchain
	}
}

const ethFt: EthErc20AssetType = {
	"@type": "ERC20",
	contract: toContractAddress("ETHEREUM:0xc778417E063141139Fce010982780140Aa0cD5Ab")
}

const tezosNative: TezosXTZAssetType = {
	"@type": "XTZ"
}

const flowNative: FlowAssetTypeFt = {
	"@type": "FLOW_FT",
	contract: toContractAddress("FLOW:A.7e60df042a9c0868.FlowToken")
}
/*
const tezosFt: TezosFTAssetType = {
	"@type": "TEZOS_FT",
	contract: toContractAddress("..."),
	tokenId:
}*/

export function getCurrency(currency: CurrencyType): RequestCurrency {
	switch (currency.blockchain) {
		case Blockchain.ETHEREUM:
			if (currency.type === "NATIVE") {
				return getEthNative(currency.blockchain)
			} else if (currency.type === "ERC20") {
				return ethFt
			}
			throw new Error("Unsupported currency subtype")
		case Blockchain.POLYGON:
			if (currency.type === "NATIVE") {
				return getEthNative(currency.blockchain)
			} else if (currency.type === "ERC20") {
				return ethFt
			}
			throw new Error("Unsupported currency subtype")
		case Blockchain.TEZOS:
			if (currency.type === "NATIVE") {
				return tezosNative
			} else if (currency.type === "TEZOS_FT") {
				throw new Error("Unsupported currency subtype")
			}
			return tezosNative
		case Blockchain.FLOW:
			if (currency.type === "NATIVE") {
				return flowNative
			}
			throw new Error("Unsupported currency subtype")
		default:
			throw new Error("Unsupported blockchain")
	}
}
