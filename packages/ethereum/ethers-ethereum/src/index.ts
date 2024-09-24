import type { Contract } from "ethers"
import { ethers } from "ethers"
import type { TransactionResponse, TransactionRequest } from "@ethersproject/abstract-provider"
import type * as EthereumProvider from "@rarible/ethereum-provider"
import type {
  EthereumTransactionEvent,
  MessageTypes,
  TypedMessage,
  EthereumSendTransactionOptions,
} from "@rarible/ethereum-provider"
import { EthereumProviderError, Provider, signTypedData } from "@rarible/ethereum-provider"
import type { Address, BigNumber, Binary, Word } from "@rarible/types"
import { toAddress, toBigNumber, toBinary, toWord } from "@rarible/types"
import type { TypedDataSigner } from "@ethersproject/abstract-signer"
import { BigNumber as EthersBN } from "ethers/lib/ethers"
import type { Web3Provider } from "@ethersproject/providers"
import { getDappType, promiseSettledRequest } from "@rarible/sdk-common"
import { decodeParameters, encodeParameters } from "./abi-coder"
import { getTxEvents } from "./utils/parse-logs"

export class EthersWeb3ProviderEthereum implements EthereumProvider.Ethereum {
  constructor(
    readonly web3Provider: ethers.providers.Web3Provider,
    readonly from?: string,
  ) {
    this.send = this.send.bind(this)
  }

  createContract(abi: any, address?: string): EthereumProvider.EthereumContract {
    if (!address) {
      throw new Error("No Contract address provided, it's required for EthersEthereum")
    }
    return new EthersContract(
      new ethers.Contract(address, abi, this.web3Provider.getSigner()),
      this.web3Provider.getSigner(),
    )
  }

  async send(method: string, params: any): Promise<any> {
    try {
      return await this.web3Provider.send(method, params)
    } catch (e: any) {
      let signer: string | undefined
      try {
        signer = await this.getFrom()
      } catch (e) {}
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersWeb3ProviderEthereum.send",
        error: e,
        data: {
          method,
          params,
          from: signer,
        },
      })
    }
  }

  async sendTransaction(options: EthereumSendTransactionOptions): Promise<any> {
    try {
      let enrichedData = options.data || "0x"
      if (options.additionalData) {
        const additionalData = toBinary(options.additionalData).slice(2)
        enrichedData = `0x${enrichedData}${additionalData}`
      }
      const signer = this.web3Provider.getSigner()
      const txConfig: TransactionRequest = {
        to: options.to,
        data: enrichedData,
        value: options.value !== undefined ? ethers.utils.hexValue(EthersBN.from(options.value)) : undefined,
      }
      if (options.gas !== undefined) {
        txConfig.gasLimit = options.gas
      }
      if (options.gasPrice !== undefined) {
        txConfig.gasPrice = options.gasPrice
      }
      const tx = await signer.sendTransaction(txConfig)

      return new EthersTransaction(tx)
    } catch (e: any) {
      let signer: string | undefined
      try {
        signer = await this.getFrom()
      } catch (e) {}
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersWeb3ProviderEthereum.sendTransaction",
        error: e,
        data: {
          options,
          from: signer,
        },
      })
    }
  }

  async personalSign(message: string): Promise<string> {
    try {
      return await this.web3Provider.getSigner().signMessage(message)
    } catch (e: any) {
      let signer: string | undefined
      try {
        signer = await this.getFrom()
      } catch (e) {}
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersWeb3ProviderEthereum.personalSign",
        error: e,
        data: {
          message,
          from: signer,
        },
      })
    }
  }

  async signTypedData<T extends MessageTypes>(data: TypedMessage<T>): Promise<string> {
    let signer: string | undefined
    try {
      signer = await this.getFrom()
      return await signTypedData(this.send, signer, data)
    } catch (e: any) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersWeb3ProviderEthereum.signTypedData",
        error: e,
        data,
        signer,
      })
    }
  }

  async getFrom(): Promise<string> {
    try {
      if (!this.from) {
        const [first] = await this.web3Provider.listAccounts()
        return first
      }
      return this.from
    } catch (e) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersWeb3ProviderEthereum.getFrom",
        error: e,
        data: null,
      })
    }
  }

  encodeParameter(type: any, parameter: any): string {
    try {
      return encodeParameters([type], [parameter])
    } catch (e: any) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersWeb3ProviderEthereum.encodeParameter",
        error: e,
        data: { type, parameter },
      })
    }
  }

  decodeParameter(type: any, data: string): any {
    try {
      return decodeParameters([type], data)
    } catch (e: any) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersWeb3ProviderEthereum.decodeParameter",
        error: e,
        data: { type, data },
      })
    }
  }

  async getBalance(address: Address): Promise<BigNumber> {
    try {
      const balance = await this.web3Provider.getBalance(address)
      return toBigNumber(balance.toString())
    } catch (e: any) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersWeb3ProviderEthereum.getBalance",
        error: e,
        data: { address },
      })
    }
  }

  async getChainId(): Promise<number> {
    try {
      const { chainId } = await this.web3Provider.getNetwork()
      return +chainId
    } catch (e) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersWeb3ProviderEthereum.getChainId",
        error: e,
        data: null,
      })
    }
  }

  getCurrentProvider(): any {
    return this.web3Provider.provider
  }
}

export class EthersEthereum implements EthereumProvider.Ethereum {
  constructor(readonly signer: TypedDataSigner & ethers.Signer) {}

  getCurrentProvider(): any {
    return getCurrentProviderFromSigner(this.signer)
  }

  createContract(abi: any, address?: string): EthereumProvider.EthereumContract {
    if (!address) {
      throw new Error("No Contract address provided, it's required for EthersEthereum")
    }
    return new EthersContract(new ethers.Contract(address, abi, this.signer), this.signer)
  }

  async personalSign(message: string): Promise<string> {
    try {
      return await this.signer.signMessage(message)
    } catch (e: any) {
      let signer: string | undefined
      try {
        signer = await this.getFrom()
      } catch (e) {}
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersEthereum.personalSign",
        error: e,
        data: {
          message,
          from: signer,
        },
      })
    }
  }

  async sendTransaction(options: EthereumSendTransactionOptions) {
    let enrichedData = options.data || "0x"
    if (options.additionalData) {
      const additionalData = toBinary(options.additionalData).slice(2)
      enrichedData = `0x${enrichedData}${additionalData}`
    }

    const txConfig: TransactionRequest = {
      from: await this.signer.getAddress(),
      to: options.to,
      data: enrichedData,
      value: options.value !== undefined ? ethers.utils.hexValue(EthersBN.from(options.value)) : undefined,
    }
    if (options.gas !== undefined) {
      txConfig.gasLimit = options.gas
    }
    if (options.gasPrice !== undefined) {
      txConfig.gasPrice = options.gasPrice
    }
    const tx = await this.signer.sendTransaction(txConfig)

    return new EthersTransaction(tx)
  }

  async signTypedData<T extends MessageTypes>(data: TypedMessage<T>): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { EIP712Domain, ...types } = data.types
      return await this.signer._signTypedData(data.domain, types, data.message)
    } catch (e: any) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersEthereum.signTypedData",
        error: e,
        data,
      })
    }
  }

  async getFrom(): Promise<string> {
    try {
      return await this.signer.getAddress()
    } catch (e) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersEthereum.getFrom",
        error: e,
        data: null,
      })
    }
  }

  encodeParameter(type: any, parameter: any): string {
    try {
      return encodeParameters([type], [parameter])
    } catch (e: any) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersEthereum.encodeParameter",
        error: e,
        data: { type, parameter },
      })
    }
  }

  decodeParameter(type: any, data: string): any {
    try {
      return decodeParameters([type], data)
    } catch (e: any) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersEthereum.decodeParameter",
        error: e,
        data: { type, data },
      })
    }
  }

  async getBalance(address: Address): Promise<BigNumber> {
    if (!this.signer.provider) {
      throw new Error("EthersEthereum: signer provider does not exist")
    }
    try {
      const balance = await this.signer.provider.getBalance(address)
      return toBigNumber(balance.toString())
    } catch (e: any) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersEthereum.getBalance",
        error: e,
        data: { address },
      })
    }
  }

  async getChainId(): Promise<number> {
    try {
      return +(await this.signer.getChainId())
    } catch (e) {
      throw new EthereumProviderError({
        providerId: getDappType(this.getCurrentProvider()),
        provider: Provider.ETHERS,
        method: "EthersEthereum.getChainId",
        error: e,
        data: null,
      })
    }
  }
}

export class EthersContract implements EthereumProvider.EthereumContract {
  constructor(
    private readonly contract: Contract,
    private readonly signer: TypedDataSigner & ethers.Signer,
  ) {}

  functionCall(name: string, ...args: any): EthereumProvider.EthereumFunctionCall {
    return new EthersFunctionCall(this.signer, this.contract, name, args)
  }
}

export class EthersFunctionCall implements EthereumProvider.EthereumFunctionCall {
  constructor(
    private readonly signer: TypedDataSigner & ethers.Signer,
    private readonly contract: Contract,
    private readonly name: string,
    private readonly args: any[],
  ) {}

  async getCallInfo(): Promise<EthereumProvider.EthereumFunctionCallInfo> {
    let from: string | undefined
    try {
      from = await this.signer.getAddress()
    } catch (e) {
      from = ""
    }
    return {
      from,
      method: this.name,
      args: this.args,
      contract: this.contract.address,
      provider: Provider.ETHERS,
    }
  }

  async getData(): Promise<string> {
    try {
      return (await this.contract.populateTransaction[this.name](...this.args)).data || "0x"
    } catch (e: any) {
      throw new EthereumProviderError({
        provider: Provider.ETHERS,
        providerId: getCurrentProviderFromSigner(this.signer),
        method: "EthersFunctionCall.getData",
        error: e,
        data: await this.getCallInfo(),
      })
    }
  }

  async estimateGas(options?: EthereumProvider.EthereumSendOptions) {
    try {
      const func = this.contract.estimateGas[this.name].bind(null, ...this.args)
      const value = await func(options)
      return value.toNumber()
    } catch (e) {
      throw new EthereumProviderError({
        provider: Provider.ETHERS,
        providerId: getCurrentProviderFromSigner(this.signer),
        method: "EthersFunctionCall.estimateGas",
        error: e,
        data: {
          ...(await this.getCallInfo()),
          options,
        },
      })
    }
  }

  async call(options?: EthereumProvider.EthereumSendOptions): Promise<any> {
    try {
      const func = this.contract[this.name].bind(null, ...this.args)
      if (options) {
        return await func(options)
      } else {
        return await func()
      }
    } catch (e: any) {
      let callInfo = null,
        callData = null
      try {
        ;[callInfo, callData] = await promiseSettledRequest([this.getCallInfo(), this.getData()])
      } catch (e) {}
      throw new EthereumProviderError({
        provider: Provider.ETHERS,
        providerId: getCurrentProviderFromSigner(this.signer),
        method: "EthersFunctionCall.call",
        error: e,
        data: {
          ...(callInfo || {}),
          data: callData,
          options,
        },
      })
    }
  }

  async send(options?: EthereumProvider.EthereumSendOptions): Promise<EthereumProvider.EthereumTransaction> {
    let hashValue: string | undefined
    try {
      if (options?.additionalData) {
        const additionalData = toBinary(options.additionalData).slice(2)
        const sourceData = toBinary(await this.getData()).slice(2)

        const txConfig: TransactionRequest = {
          from: await this.signer.getAddress(),
          to: this.contract.address,
          data: `0x${sourceData}${additionalData}`,
          value: options.value !== undefined ? ethers.utils.hexValue(EthersBN.from(options.value)) : undefined,
        }
        if (options.gas !== undefined) {
          txConfig.gasLimit = options.gas
        }
        if (options.gasPrice !== undefined) {
          txConfig.gasPrice = options.gasPrice
        }
        const tx = await this.signer.sendTransaction(txConfig)

        return new EthersTransaction(tx, this.contract)
      }

      const func = this.contract[this.name].bind(null, ...this.args)
      if (options) {
        const tx = await func(options)
        hashValue = tx.hash
        return new EthersTransaction(tx)
      } else {
        const tx = await func()
        hashValue = tx.hash
        return new EthersTransaction(tx)
      }
    } catch (e: any) {
      let callInfo = null,
        callData = null
      try {
        ;[callInfo, callData] = await promiseSettledRequest([this.getCallInfo(), this.getData()])
      } catch (e) {}
      throw new EthereumProviderError({
        provider: Provider.ETHERS,
        providerId: getCurrentProviderFromSigner(this.signer),
        method: "EthersFunctionCall.send",
        error: e,
        data: {
          ...(callInfo || {}),
          data: callData,
          hash: hashValue,
          options,
        },
      })
    }
  }
}

export class EthersTransaction implements EthereumProvider.EthereumTransaction {
  constructor(
    private readonly tx: TransactionResponse,
    private readonly contract?: Contract,
  ) {}

  get hash(): Word {
    return toWord(this.tx.hash)
  }

  async wait(): Promise<EthereumProvider.EthereumTransactionReceipt> {
    try {
      const receipt = await this.tx.wait()
      const status = receipt.status === 1

      return {
        ...receipt,
        status,
      }
    } catch (e: any) {
      throw new EthereumProviderError({
        provider: Provider.ETHERS,
        method: "EthersTransaction.wait",
        error: e,
        data: {
          hash: this.hash,
          data: this.data,
          nonce: this.nonce,
          from: this.from,
          to: this.to,
        },
      })
    }
  }

  async getEvents(): Promise<EthereumTransactionEvent[]> {
    try {
      const receipt = await this.tx.wait()

      if (this.contract) {
        return getTxEvents(receipt, this.contract)
      }

      return (receipt as any)?.events || []
    } catch (e: any) {
      throw new EthereumProviderError({
        provider: Provider.ETHERS,
        method: "EthersTransaction.getEvents",
        error: e,
        data: {
          hash: this.hash,
          data: this.data,
          nonce: this.nonce,
          from: this.from,
          to: this.to,
        },
      })
    }
  }

  get to(): Address | undefined {
    return this.tx.to ? toAddress(this.tx.to) : undefined
  }

  get from(): Address {
    return toAddress(this.tx.from)
  }

  get data(): Binary {
    return toBinary(this.tx.data)
  }

  get nonce(): number {
    return this.tx.nonce
  }
}

function getCurrentProviderFromSigner(signer: TypedDataSigner & ethers.Signer): any {
  if (signer.provider && "provider" in signer.provider) {
    return (signer.provider as Web3Provider).provider
  }
  return null
}
