import type { BigNumberValue } from "@rarible/utils"
import { createErc20Contract } from "@rarible/protocol-ethereum-sdk/build/order/contracts/erc20"
import { toAddress } from "@rarible/types"
import { toBn } from "@rarible/utils"
import type { EVMSuiteProvider, EVMSuiteSupportedBlockchain } from "../../domain"
import { ERC20 } from "./erc20"

export class ERC20Mintable<T extends EVMSuiteSupportedBlockchain> extends ERC20<T> {
	constructor(
    	blockchain: T,
    	addressString: string,
    	provider: EVMSuiteProvider<T>
	) {
    	super(createErc20Contract(provider, toAddress(addressString)), blockchain, addressString, provider)
	}

    mint = async (valueDecimal: number, mintTo?: string) => {
    	const valueInWei = await this.toWei(valueDecimal)
    	return this.mintWei(valueInWei, mintTo)
    }

    mintWei = async (valueWei: BigNumberValue, mintTo?: string) => {
    	const from = mintTo || await this.operator
    	const valueWeiString = toBn(valueWei).toString()
    	const tx = await this.contract.functionCall("mint", from, valueWeiString).send()
    	return tx.wait()
    }
}