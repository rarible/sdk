import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { UnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction/src"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction/src"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { convertToEthereumAddress, convertToEthereumAssetType } from "./common"

export class EthereumBalance {
	constructor(
		private sdk: RaribleSdk,
		private network: EthereumNetwork,
	) {
		this.getBalance = this.getBalance.bind(this)
		this.convert = this.convert.bind(this)
	}

	async getBalance(address: UnionAddress, assetType: AssetType): Promise<BigNumberValue> {
		const convertedAssetType = convertToEthereumAssetType(assetType)
		if (convertedAssetType.assetClass !== "ETH" && convertedAssetType.assetClass !== "ERC20") {
			throw new Error("Unsupported asset type for getting balance")
		}
		const ethAddress = convertToEthereumAddress(address)
		return this.sdk.balances.getBalance(ethAddress, convertedAssetType)
	}

	async convert(from: AssetType, to: AssetType, value: BigNumberValue): Promise<IBlockchainTransaction> {
		const tx = await this.sdk.balances.convert(
			convertToEthereumAssetType(from),
			convertToEthereumAssetType(to),
			value
		)
		return new BlockchainEthereumTransaction(tx, this.network)
	}
}
