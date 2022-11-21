import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import { BigNumber } from "@rarible/utils"
import type { AssetType } from "@rarible/ethereum-api-client"
import type { Address } from "@rarible/types"
import type { EthereumConfig } from "../config/type"
import type { SendFunction } from "../common/send-transaction"
import { createWethContract } from "./contracts/weth"
import { checkChainId } from "./check-chain-id"

export class ConvertWeth {
	constructor(
		private ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
	) {
		this.convertEthToWeth = this.convertEthToWeth.bind(this)
		this.convertWethToEth = this.convertWethToEth.bind(this)
		this.convert = this.convert.bind(this)
		this.getWethContractAddress = this.getWethContractAddress.bind(this)
	}

	private async convertEthToWeth(value: BigNumberValue): Promise<EthereumTransaction> {
		if (!this.ethereum) {
			throw new Error("Wallet is undefined")
		}
		const contract = createWethContract(this.ethereum, this.config.weth)
		const decimals = await contract.functionCall("decimals").call()

		return this.send(
			contract.functionCall("deposit"),
			{
				value: new BigNumber(value)
					.multipliedBy(new BigNumber(10).pow(Number(decimals)))
					.toString(),
			}
		)
	}

	private async convertWethToEth(value: BigNumberValue): Promise<EthereumTransaction> {
		if (!this.ethereum) {
			throw new Error("Wallet is undefined")
		}
		const contract = createWethContract(this.ethereum, this.config.weth)
		const decimals = await contract.functionCall("decimals").call()
		const rawValue = new BigNumber(value).multipliedBy(new BigNumber(10).pow(Number(decimals))).toString()
		return this.send(
			contract.functionCall("withdraw", rawValue)
		)
	}

	async convert(from: AssetType, to: AssetType, value: BigNumberValue): Promise<EthereumTransaction> {
		await checkChainId(this.ethereum, this.config)
		if (from.assetClass === "ETH" && to.assetClass === "ERC20") {
			if (to.contract !== this.config.weth) {
				throw new Error(`Unsupported WETH contract address ${to.contract}, expected ${this.config.weth}`)
			}
			return this.convertEthToWeth(value)
		}
		if (from.assetClass === "ERC20" && to.assetClass === "ETH") {
			if (from.contract !== this.config.weth) {
				throw new Error(`Unsupported WETH contract address ${from.contract}, expected ${this.config.weth}`)
			}
			return this.convertWethToEth(value)
		}
		throw new Error("Unsupported convert asset types")
	}

	getWethContractAddress(): Address {
		return this.config.weth
	}
}
