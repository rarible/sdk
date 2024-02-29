import type { Address } from "@rarible/types"
import type { Erc20AssetType, EthAssetType } from "@rarible/ethereum-api-client/build/models/AssetType"
import type { BigNumber } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { ApiService } from "../apis"

export type BalanceRequestAssetType = EthAssetType | Erc20AssetType

export class Balances {
	constructor(private readonly apiService: ApiService) {
		this.getBalance = this.getBalance.bind(this)
	}

	async getBalance(address: Address, assetType: BalanceRequestAssetType): Promise<BigNumber> {
		const apis = this.apiService.apis
		switch (assetType.assetClass) {
			case "ETH": {
				const ethBalance = await apis.balances.getEthBalance({ owner: address })
				return toBn(ethBalance.decimalBalance)
			}
			case "ERC20": {
				const balance = await apis.balances.getErc20Balance({
					contract: assetType.contract,
					owner: address,
				})
				return toBn(balance.decimalBalance)
			}
			default: throw new Error("Asset class is not supported")
		}
	}
}
