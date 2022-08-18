import type { RaribleImxSdk } from "@rarible/immutable-sdk/src/domain"
import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { toAddress } from "@rarible/types"
import type { RequestCurrency } from "../../common/domain"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { IApisSdk } from "../../domain"
import { convertToEthereumAddress } from "./common/utils"

export class ImxBalanceService {
	constructor(private sdk: RaribleImxSdk, private apis: IApisSdk) {
		this.getBalance = this.getBalance.bind(this)
	}

	async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
		const assetType = getCurrencyAssetType(currency)
		switch (assetType["@type"]) {
			case "ETH":
				return await this.sdk.balance.getBalance(convertToEthereumAddress(address), { assetClass: "ETH" })
			case "ERC20":
				const [, contractAddress] = assetType.contract.split(":")
				return await this.sdk.balance.getBalance(convertToEthereumAddress(address), {
					assetClass: "ERC20",
					contract: toAddress(contractAddress),
				})
			default:
				throw new Error("Unsupported asset type")
		}
	}
}
