import {
	Blockchain,
	EthErc20AssetType,
	EthEthereumAssetType,
	TezosXTZAssetType,
	FlowAssetTypeFt,
} from "@rarible/api-client"
import { toContractAddress, ContractAddress } from "@rarible/types"
import { CurrencyType, RequestCurrency } from "@rarible/sdk/build/common/domain"
import { SolanaSolAssetType } from "@rarible/api-client/build/models/AssetType"
import { RaribleSdkEnvironment } from "@rarible/sdk/src/config/domain"

function getEthNative(blockchain: Blockchain): EthEthereumAssetType {
	return {
		"@type": "ETH",
		blockchain,
	}
}

function getERC20(contract: ContractAddress): EthErc20AssetType {
	return {
		"@type": "ERC20",
		contract
	}
}

const tezosNative: TezosXTZAssetType = {
	"@type": "XTZ",
}

const solanaNative: SolanaSolAssetType = {
	"@type": "SOLANA_SOL",
}

const flowNative: FlowAssetTypeFt = {
	"@type": "FLOW_FT",
	contract: toContractAddress("FLOW:A.7e60df042a9c0868.FlowToken"),
}

export type CurrencyOption = {
	type: "NATIVE",
	label: string,
	blockchain: Blockchain,
} | {
	type: "TOKEN",
	label: string,
	blockchain: Blockchain,
	contract: string | null
}

export function getCurrency(blockchain: Blockchain, type: CurrencyOption["type"], contract: ContractAddress): RequestCurrency {
	switch (blockchain) {
		case Blockchain.ETHEREUM:
			if (type === "NATIVE") {
				return getEthNative(blockchain)
			} else if (type === "TOKEN") {
				return getERC20(contract)
			}
			throw new Error("Unsupported option subtype")
		case Blockchain.POLYGON:
			if (type === "NATIVE") {
				return getEthNative(blockchain)
			} else if (type === "TOKEN") {
				return getERC20(contract)
			}
			throw new Error("Unsupported option subtype")
		case Blockchain.IMMUTABLEX:
			if (type === "NATIVE") {
				return getEthNative(blockchain)
			}
			throw new Error("Unsupported option subtype")
		case Blockchain.TEZOS:
			if (type === "NATIVE") {
				return tezosNative
			}
			throw new Error("Unsupported option subtype")
		case Blockchain.SOLANA:
			if (type === "NATIVE") {
				return solanaNative
			}
			throw new Error("Unsupported blockchain or asset type")
		case Blockchain.FLOW:
			if (type === "NATIVE") {
				return flowNative
			}
			throw new Error("Unsupported currency subtype")
		default:
			throw new Error("Unsupported blockchain")
	}
}

export function getCurrencyOptions(supportedCurrencies: CurrencyType[], environment: RaribleSdkEnvironment): CurrencyOption[] {
	return supportedCurrencies.flatMap((currency) => {
		switch (currency.blockchain) {
			case Blockchain.ETHEREUM:
				if (currency.type === "NATIVE") {
					return { type: "NATIVE", label: "ETH", blockchain: Blockchain.ETHEREUM }
				} else if (currency.type === "ERC20") {
					const res: CurrencyOption[] = []
					switch (environment) {
						case "development":
							res.push({
								type: "TOKEN",
								label: "Rarible Test ERC20",
								blockchain: Blockchain.ETHEREUM,
								contract: "ETHEREUM:0xA4A70E8627e858567a9f1F08748Fe30691f72b9e",
							})
							break
						case"testnet":
							res.push({
								type: "TOKEN",
								label: "Rarible Test ERC20",
								blockchain: Blockchain.ETHEREUM,
								contract: "ETHEREUM:0xCfaF03B6254363bcA1A9D8e529270B5660bF3109",
							})
							res.push({
								type: "TOKEN",
								label: "Goerli WETH",
								blockchain: Blockchain.ETHEREUM,
								contract: "ETHEREUM:0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
							})
							break
						case "staging":
							res.push({
								type: "TOKEN",
								label: "Rarible Test ERC20",
								blockchain: Blockchain.ETHEREUM,
								contract: "ETHEREUM:0x02cc113a068B643e4f98195935496aaf3E572e86",
							})
							break
						case"prod":
							res.push({
								type: "TOKEN",
								label: "WETH",
								blockchain: Blockchain.ETHEREUM,
								contract: "ETHEREUM:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
							})
							break
						default:
					}
					res.push({ type: "TOKEN", label: "Custom ERC20", blockchain: Blockchain.ETHEREUM, contract: null })
					return res
				}
				return []
			case Blockchain.POLYGON:
				if (currency.type === "NATIVE") {
					return { type: "NATIVE", label: "ETH", blockchain: Blockchain.POLYGON } as CurrencyOption
				} else if (currency.type === "ERC20") {
					const res: CurrencyOption[] = []
					switch (environment) {
						case "development":
							res.push({
								type: "TOKEN",
								label: "Rarible Test ERC20",
								blockchain: Blockchain.POLYGON,
								contract: "ETHEREUM:0xf4520E73A0212166C07279428527b9d300295203",
							})
							break
						case"testnet":
							res.push({
								type: "TOKEN",
								label: "Rarible Test ERC20",
								blockchain: Blockchain.POLYGON,
								contract: "ETHEREUM:0xd6e804e7EDB5B2AecB31D9cCC9d9F3940a7b4cE2",
							})
							break
						case "staging":
							res.push({
								type: "TOKEN",
								label: "Rarible Test ERC20",
								blockchain: Blockchain.ETHEREUM,
								contract: "ETHEREUM:0x32CcA2bB34B36409b29166FbEC9b617CdA1E0410",
							})
							break
						case"prod":
							res.push({
								type: "TOKEN",
								label: "WETH",
								blockchain: Blockchain.POLYGON,
								contract: "ETHEREUM:0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
							})
							break
						default:
					}
					res.push({ type: "TOKEN", label: "Custom ERC20", blockchain: Blockchain.POLYGON, contract: null })
					return res
				}
				return []
			case Blockchain.IMMUTABLEX:
				if (currency.type === "NATIVE") {
					return { type: "NATIVE", label: "ETH", blockchain: Blockchain.IMMUTABLEX }
				}
				return []
			case Blockchain.TEZOS:
				if (currency.type === "NATIVE") {
					return { type: "NATIVE", label: "XTZ", blockchain: Blockchain.TEZOS }
				}
				return []
			case Blockchain.SOLANA:
				if (currency.type === "NATIVE") {
					return { type: "NATIVE", label: "SOL", blockchain: Blockchain.SOLANA }
				}
				return []
			case Blockchain.FLOW:
				if (currency.type === "NATIVE") {
					return { type: "NATIVE", label: "FLOW", blockchain: Blockchain.FLOW }
				}
				return []
			default:
				throw new Error("Unsupported blockchain")
		}
	})
}