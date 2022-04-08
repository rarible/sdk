import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { UnionAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type {
	AssetType as EthereumAssetType,
} from "@rarible/ethereum-api-client"
import type { ConvertRequest } from "../../types/balances"
import { getCurrencyAssetType } from "../../common/get-currency-asset-type"
import type { RequestCurrency } from "../../common/domain"
import { convertToEthereumAddress, convertToEthereumAssetType } from "./common"

export class EthereumBalance {
	constructor(
		private sdk: RaribleSdk,
		private network: EthereumNetwork,
	) {
		this.getBalance = this.getBalance.bind(this)
		this.convert = this.convert.bind(this)
	}

	async getBalance(address: UnionAddress, currency: RequestCurrency): Promise<BigNumberValue> {
		const assetType = getCurrencyAssetType(currency)
		const convertedAssetType = convertToEthereumAssetType(assetType)
		if (convertedAssetType.assetClass !== "ETH" && convertedAssetType.assetClass !== "ERC20") {
			throw new Error("Unsupported asset type for getting balance")
		}
		const ethAddress = convertToEthereumAddress(address)
		return this.sdk.balances.getBalance(ethAddress, convertedAssetType)
	}

	async convert(request: ConvertRequest): Promise<IBlockchainTransaction> {
		const wethContract = this.sdk.balances.getWethContractAddress()
		let from: EthereumAssetType
		let to: EthereumAssetType

		if (request.isWrap) {
			from = { assetClass: "ETH" }
			to = {
				assetClass: "ERC20",
				contract: wethContract,
			}
		} else {
			from = {
				assetClass: "ERC20",
				contract: wethContract,
			}
			to = { assetClass: "ETH" }
		}
		const tx = await this.sdk.balances.convert(from, to, request.value)
		return new BlockchainEthereumTransaction(tx, this.network)
	}
}
