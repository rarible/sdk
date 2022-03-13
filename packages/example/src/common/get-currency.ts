import {
	Blockchain,
	EthErc20AssetType,
	EthEthereumAssetType,
	TezosXTZAssetType
} from "@rarible/api-client"
import { toContractAddress } from "@rarible/types"
import { RequestCurrency } from "@rarible/sdk/build/common/domain"

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

/*const tezosFt: TezosFTAssetType = {
	"@type": "TEZOS_FT",
	contract: toContractAddress("ETHEREUM:0xc778417E063141139Fce010982780140Aa0cD5Ab"),
	tokenId:
}*/

export function getCurrency(blockchain: Blockchain | undefined, type: "NATIVE" | "FT"): RequestCurrency {
	switch (blockchain) {
		case Blockchain.ETHEREUM:
			return type === "NATIVE" ? getEthNative(blockchain) : ethFt
		case Blockchain.POLYGON:
			return type === "NATIVE" ? getEthNative(blockchain) : ethFt
		case Blockchain.TEZOS:
			if (type === "FT") {
				throw new Error("Unsupported blockchain or asset type")
			}
			return tezosNative
		case Blockchain.FLOW:
			//return type === "NATIVE" ? undefined : undefined
			throw new Error("Unsupported blockchain")
		default:
			throw new Error("Unsupported blockchain")
	}
}