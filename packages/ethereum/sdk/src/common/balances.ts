import type { Address } from "@rarible/types"
import type {
	Erc20AssetType,
	EthAssetType,
} from "@rarible/ethereum-api-client/build/models/AssetType"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { RaribleEthereumApis } from "./apis"
import { wrapInRetry } from "./retry"
import { ETHER_IN_WEI } from "./index"

export type BalanceRequestAssetType = EthAssetType | Erc20AssetType

export class Balances {
	constructor(private readonly getApis: () => Promise<RaribleEthereumApis>) {
		this.getBalance = this.getBalance.bind(this)
	}

	async getBalance(address: Address, assetType: BalanceRequestAssetType): Promise<BigNumberValue> {
		const apis = await this.getApis()
		switch (assetType.assetClass) {
			case "ETH": {
				const ethBalance = await wrapInRetry(() =>
					apis.balances.getEthBalance({ owner: address })
				)
				return toBn(ethBalance.balance).div(ETHER_IN_WEI)
			}
			case "ERC20": {
				const balance = await wrapInRetry(() =>
					apis.balances.getErc20Balance({
						contract: assetType.contract,
						owner: address,
					})
				)
				return toBn(balance.balance).div(ETHER_IN_WEI)
			}
			default: throw new Error("Asset class is not supported")
		}
	}
}
