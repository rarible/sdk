import { Blockchain } from "@rarible/api-client"
import { RequestCurrencyAssetType } from "@rarible/sdk/src/common/domain"
import { WalletType } from "@rarible/sdk-wallet"

interface ISupportedCurrency {
	isNative: boolean
	requireContract: boolean
	getAssetType(contract?: string): RequestCurrencyAssetType
}

export function getCurrenciesForBlockchain(blockchain: WalletType): ISupportedCurrency[] {
	switch (blockchain) {
		case WalletType.ETHEREUM:
			return [{
				isNative: true,
				requireContract: false,
				getAssetType: (contract?: string) => ({
					"@type": "ETH",
					blockchain: Blockchain.ETHEREUM,
				}),
			}]
		case WalletType.IMMUTABLEX:
			return [{
				isNative: true,
				requireContract: false,
				getAssetType: (contract?: string) => ({
					"@type": "ETH",
					blockchain: Blockchain.IMMUTABLEX,
				}),
			}]
		case WalletType.SOLANA:
			return [{
				isNative: true,
				requireContract: false,
				getAssetType: (contract?: string) => ({
					"@type": "SOLANA_SOL"
				}),
			}]
		case WalletType.TEZOS:
			return [{
				isNative: true,
				requireContract: false,
				getAssetType: (contract?: string) => ({
					"@type": "XTZ"
				}),
			}]
		case WalletType.FLOW:
			return []
		default:
			throw new Error("Unsupported blockchain")
	}
}
