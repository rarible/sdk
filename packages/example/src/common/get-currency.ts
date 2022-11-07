import {
	Blockchain,
	EthErc20AssetType,
	EthEthereumAssetType,
	TezosXTZAssetType,
	FlowAssetTypeFt
} from "@rarible/api-client"
import { toContractAddress } from "@rarible/types"
import { CurrencyType, RequestCurrency } from "@rarible/sdk/build/common/domain"
import { SolanaSolAssetType } from "@rarible/api-client/build/models/AssetType"

function getEthNative(blockchain: Blockchain): EthEthereumAssetType {
	return {
		"@type": "ETH",
		blockchain
	}
}

const ethFt: EthErc20AssetType = {
	"@type": "ERC20",
	contract: toContractAddress("ETHEREUM:0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6")
}

const tezosNative: TezosXTZAssetType = {
	"@type": "XTZ"
}

const solanaNative: SolanaSolAssetType = {
	"@type": "SOLANA_SOL"
}

const flowNative: FlowAssetTypeFt = {
	"@type": "FLOW_FT",
	contract: toContractAddress("FLOW:A.7e60df042a9c0868.FlowToken")
}

/*const tezosFt: TezosFTAssetType = {
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
		case Blockchain.IMMUTABLEX:
			if (currency.type === "NATIVE") {
				return getEthNative(currency.blockchain)
			}
			throw new Error("Unsupported currency subtype")
		case Blockchain.TEZOS:
			if (currency.type === "NATIVE") {
				return tezosNative
			} else if (currency.type === "TEZOS_FT") {
				throw new Error("Unsupported currency subtype")
			}
			return tezosNative
		case Blockchain.SOLANA:
			if (currency.type === "ERC20") {
				throw new Error("Unsupported blockchain or asset type")
			}
			return solanaNative
		case Blockchain.FLOW:
			if (currency.type === "NATIVE") {
				return flowNative
			}
			throw new Error("Unsupported currency subtype")
		default:
			throw new Error("Unsupported blockchain")
	}
}