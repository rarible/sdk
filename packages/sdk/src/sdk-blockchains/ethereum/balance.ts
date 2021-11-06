import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { UnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { Erc20AssetType, EthAssetType } from "@rarible/ethereum-api-client"
import type { BigNumberValue } from "@rarible/utils"
import { convertUnionToEthereumAddress } from "./common"

export class Balance {
	constructor(
		private sdk: RaribleSdk
	) {
		this.getBalance = this.getBalance.bind(this)
	}

	convertAssetType(assetType: AssetType): EthAssetType | Erc20AssetType {
		switch (assetType["@type"]) {
			case "ETH": {
				return { assetClass: "ETH" }
			}
			case "ERC20": {
				return {
					assetClass: "ERC20",
					contract: convertUnionToEthereumAddress(assetType.contract),
				}
			}
			default: {
				throw new Error(`Unsupported asset type=${assetType["@type"]}`)
			}
		}
	}

	async getBalance(address: UnionAddress, assetType: AssetType): Promise<BigNumberValue> {
		const ethAddress = convertUnionToEthereumAddress(address)
		const convertedAssetType = this.convertAssetType(assetType)
		return this.sdk.balances.getBalance(ethAddress, convertedAssetType)
	}
}
