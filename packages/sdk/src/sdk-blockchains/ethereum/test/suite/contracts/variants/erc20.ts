import type { EthErc20AssetType } from "@rarible/api-client"
import type { Address } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { EthereumContract } from "@rarible/ethereum-provider/build"
import type { EVMSuiteProvider, EVMSuiteSupportedBlockchain } from "../../domain"
import { EVMContractBase } from "./base"

export class ERC20<T extends EVMSuiteSupportedBlockchain> extends EVMContractBase<T> {
    readonly operator = this.provider.getFrom()

    constructor(
    	public readonly contract: EthereumContract,
    	blockchain: T,
    	addressString: string,
    	provider: EVMSuiteProvider<T>
    ) {
    	super(blockchain, addressString, provider)
    }

	readonly asset: EthErc20AssetType = {
		"@type": "ERC20",
		contract: this.contractAddress,
	}

	balanceOf = async (owner?: string) => {
		const addressString = owner || await this.operator
		const wei = await this.contract.functionCall("balanceOf", addressString).call()
		const bn = toBn(wei)
		if (bn.isNaN()) throw new Error("Balance is NaN")
		return bn
	}

    decimals = async () => {
    	const decimalsRaw = await this.contract.functionCall("decimals").call()
    	const decimals = parseInt(decimalsRaw)
    	if (isNaN(decimals)) throw new Error("Decimals is unknown")
    	return decimals
    }

    toWei = async (valueInDecimals: BigNumberValue) => {
    	const decimals = await this.decimals()
    	return toBn(valueInDecimals).multipliedBy(toBn(10).pow(decimals))
    }

	transfer = async (to: Address, valueDecimal: BigNumberValue) => {
		const valueWei = await this.toWei(valueDecimal)
		return this.transferWei(to, valueWei)
	}

	transferWei = async (to: Address, valueWei: BigNumberValue) => {
		const tx = await this.contract.functionCall("transfer", to, valueWei).send()
		await tx.wait()
	}
}