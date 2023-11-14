import type { Address } from "@rarible/types"
import type {
	Erc20AssetType,
	EthAssetType,
} from "@rarible/ethereum-api-client/build/models/AssetType"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import { ZERO_ADDRESS } from "@rarible/types"
import type { EthereumConfig } from "../config/type"
import type { RaribleEthereumApis } from "./apis"
import { wrapInRetry } from "./retry"
import { getUnionBlockchainFromChainId } from "./get-blockchain-from-chain-id"

export type BalanceRequestAssetType = EthAssetType | Erc20AssetType

export class Balances {
	constructor(
		private readonly apis: RaribleEthereumApis,
		private readonly config: EthereumConfig,
	) {
		this.getBalance = this.getBalance.bind(this)
	}

	async getBalance(address: Address, assetType: BalanceRequestAssetType): Promise<BigNumberValue> {
		switch (assetType.assetClass) {
			case "ETH": {
				const ethBalance = await wrapInRetry(() =>
					this.apis.balances.getBalance({
						currencyId: `${getUnionBlockchainFromChainId(this.config.chainId)}:${ZERO_ADDRESS}`,
						owner: address,
					})
				)
				return toBn(ethBalance.decimal)
			}
			case "ERC20": {
				const balance = await wrapInRetry(() =>
					this.apis.balances.getBalance({
						currencyId: `${getUnionBlockchainFromChainId(this.config.chainId)}:${ZERO_ADDRESS}:${assetType.contract}`,
						owner: address,
					})
				)
				return toBn(balance.decimal)
			}
			default: throw new Error("Asset class is not supported")
		}
	}
}
