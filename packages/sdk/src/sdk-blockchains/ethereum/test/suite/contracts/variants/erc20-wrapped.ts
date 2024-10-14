import type { BigNumberValue } from "@rarible/utils"
import { createWethContract } from "@rarible/protocol-ethereum-sdk/build/order/contracts/weth"
import { toBn } from "@rarible/utils"
import { toEVMAddress } from "@rarible/types"
import type { EVMSuiteProvider, EVMSuiteSupportedBlockchain } from "../../domain"
import { ERC20 } from "./erc20"

export class ERC20Wrapped<T extends EVMSuiteSupportedBlockchain> extends ERC20<T> {
  constructor(blockchain: T, addressString: string, provider: EVMSuiteProvider<T>) {
    super(createWethContract(provider, toEVMAddress(addressString)), blockchain, addressString, provider)
  }

  withdraw = async (valueDecimal: number) => {
    const valueInWei = await this.toWei(valueDecimal)
    return this.withdrawWei(valueInWei)
  }

  withdrawWei = async (valueWei: BigNumberValue) => {
    const valueWeiString = toBn(valueWei).toString()
    const tx = await this.contract.functionCall("withdraw", valueWeiString).send()
    return tx.wait()
  }

  deposit = async (valueDecimal: BigNumberValue) => {
    const valueInWei = await this.toWei(valueDecimal)
    return this.depositWei(valueInWei)
  }

  depositWei = async (valueWei: BigNumberValue) => {
    const valueWeiString = toBn(valueWei).toString()
    const tx = await this.contract.functionCall("deposit").send({ value: valueWeiString })
    return tx.wait()
  }

  reset = async () => {
    const balanceWei = await this.balanceOf()
    if (balanceWei.isGreaterThan(0)) await this.withdrawWei(balanceWei)
  }
}
