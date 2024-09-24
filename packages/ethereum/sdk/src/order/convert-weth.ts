import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import { toBn } from "@rarible/utils"
import type { AssetType } from "@rarible/ethereum-api-client"
import type { Address } from "@rarible/types"
import type { EthereumFunctionCall } from "@rarible/ethereum-provider"
import type { SendFunction } from "../common/send-transaction"
import { getRequiredWallet } from "../common/get-required-wallet"
import { compareCaseInsensitive } from "../common/compare-case-insensitive"
import type { GetConfigByChainId } from "../config"
import { createWethContract } from "./contracts/weth"
export class ConvertWeth {
  getWethContractAddress = async () => {
    const config = await this.getConfig()
    return config.weth
  }

  constructor(
    private ethereum: Maybe<Ethereum>,
    private readonly send: SendFunction,
    private readonly getConfig: GetConfigByChainId,
  ) {
    this.deposit = this.deposit.bind(this)
    this.depositWei = this.depositWei.bind(this)
    this.withdraw = this.withdraw.bind(this)
    this.withdrawWei = this.withdrawWei.bind(this)
    this.convert = this.convert.bind(this)
  }

  /**
   * Deposits user funds to wrapped balance
   *
   * @param value amount of balance to be wrapped
   * @returns `EthereumTransaction`
   */
  async deposit(value: BigNumberValue): Promise<EthereumTransaction> {
    const decimals = await this.getContractDecimals()
    const power = toBn(10).pow(Number(decimals))
    const valueWei = toBn(value).multipliedBy(power).toString()
    return this.depositWei(valueWei)
  }

  /**
   * Deposits user funds to wrapped balance
   *
   * @param valueInWei amount of balance to be wrapped in WEI
   * @returns `EthereumTransaction`
   */

  async depositWeiFunctionCall(): Promise<EthereumFunctionCall> {
    const contract = await this.getContract()
    return contract.functionCall("deposit")
  }

  async depositWei(valueInWei: BigNumberValue): Promise<EthereumTransaction> {
    const valueBn = toBn(valueInWei)
    if (valueBn.isZero()) {
      throw new ZeroValueIsPassedError()
    }
    return this.send(await this.depositWeiFunctionCall(), {
      value: valueBn.toString(),
    })
  }

  /**
   * Withdraws user funds from wrapped balance to native currency balance
   *
   * @param value amount of balance to unwrapped
   * @returns `EthereumTransaction`
   */
  async withdraw(value: BigNumberValue): Promise<EthereumTransaction> {
    const decimals = await this.getContractDecimals()
    const valueWei = toBn(value)
      .multipliedBy(toBn(10).pow(Number(decimals)))
      .toString()
    return this.withdrawWei(valueWei)
  }

  /**
   * Withdraws user funds from wrapped balance to native currency balance
   *
   * @param valueInWei amount of balance to unwrapped in wei
   * @returns `EthereumTransaction`
   */
  async withdrawWei(valueInWei: BigNumberValue): Promise<EthereumTransaction> {
    const valueBn = toBn(valueInWei)
    if (valueBn.isZero()) {
      throw new ZeroValueIsPassedError()
    }
    const contract = await this.getContract()
    return this.send(contract.functionCall("withdraw", valueInWei))
  }

  private async getContract() {
    const config = await this.getConfig()
    const provider = getRequiredWallet(this.ethereum)
    return createWethContract(provider, config.weth)
  }

  private async getContractDecimals() {
    const contract = await this.getContract()
    return contract.functionCall("decimals").call()
  }

  /**
   * @deprecated please use `deposit` or `withdraw` functions
   */
  async convert(from: AssetType, to: AssetType, value: BigNumberValue): Promise<EthereumTransaction> {
    const config = await this.getConfig()

    if (from.assetClass === "ETH" && to.assetClass === "ERC20") {
      if (!compareCaseInsensitive(to.contract, config.weth)) {
        throw new UnsupportedCurrencyConvertError(to.contract)
      }
      return this.deposit(value)
    }
    if (from.assetClass === "ERC20" && to.assetClass === "ETH") {
      if (!compareCaseInsensitive(from.contract, config.weth)) {
        throw new UnsupportedCurrencyConvertError(from.contract)
      }
      return this.withdraw(value)
    }
    throw new UnsupportedConvertAssetTypeError()
  }
}

export class UnsupportedCurrencyConvertError extends Error {
  constructor(contract: Address) {
    super(`Contract is not supported - ${contract}`)
    this.name = "UnsupportedCurrencyConvertError"
    Object.setPrototypeOf(this, UnsupportedCurrencyConvertError.prototype)
  }
}

export class UnsupportedConvertAssetTypeError extends Error {
  constructor() {
    super("Unsupported convert asset types")
    this.name = "UnsupportedConvertAssetTypeError"
    Object.setPrototypeOf(this, UnsupportedConvertAssetTypeError.prototype)
  }
}

export class ZeroValueIsPassedError extends Error {
  constructor() {
    super("Zero value is passed")
    this.name = "ZeroValueIsPassedError"
    Object.setPrototypeOf(this, ZeroValueIsPassedError.prototype)
  }
}
