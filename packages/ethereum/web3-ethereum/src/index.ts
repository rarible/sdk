import type { Contract, ContractSendMethod, SendOptions } from "web3-eth-contract"
import type Web3 from "web3"
import type { PromiEvent, TransactionConfig, TransactionReceipt } from "web3-core"
import type * as EthereumProvider from "@rarible/ethereum-provider"
import type { MessageTypes, TypedMessage } from "@rarible/ethereum-provider"
import { EthereumProviderError, filterErrors, Provider, signTypedData } from "@rarible/ethereum-provider"
import type { Address, BigNumber, Binary, Word } from "@rarible/types"
import { toAddress, toBigNumber, toBinary, toWord } from "@rarible/types"
import { backOff } from "exponential-backoff"
import type { AbiItem } from "web3-utils"
import { DappType, getDappType, promiseSettledRequest } from "@rarible/sdk-common"
import { hasMessage } from "@rarible/ethereum-provider/build/sign-typed-data"
import type { Web3EthereumConfig, Web3EthereumGasOptions } from "./domain"
import { providerRequest } from "./utils/provider-request"
import { toPromises } from "./utils/to-promises"
import { getContractMethodReceiptEvents, getTransactionReceiptEvents } from "./utils/log-parser"

export class Web3Ethereum implements EthereumProvider.Ethereum {
	constructor(private readonly config: Web3EthereumConfig) {
		this.send = this.send.bind(this)
		this.getFrom = this.getFrom.bind(this)
	}

	createContract(abi: any, address?: string): EthereumProvider.EthereumContract {
		return new Web3Contract(this.config, new this.config.web3.eth.Contract(abi, address))
	}

	async send(method: string, params: unknown[]): Promise<any> {
		try {
		  return await providerRequest(this.config.web3.currentProvider, method, params)
		} catch (error) {
			throw new EthereumProviderError({
				...await getCommonErrorData(this.config),
				error,
				method: "Web3Ethereum.send",
				data: {
					method,
					params,
				},
			})
		}
	}

	async personalSign(message: string): Promise<string> {
		let signer: string | undefined
		try {
			signer = await this.getFrom()
			const signature = await (this.config.web3.eth.personal as any).sign(message, signer, "")
			filterErrors(signature)
			return signature
		} catch (error) {
			throw new EthereumProviderError({
				...await getCommonErrorData(this.config),
				error,
				method: "Web3Ethereum.personalSign",
				data: { message },
			})
		}
	}

	async signTypedData<T extends MessageTypes>(data: TypedMessage<T>): Promise<string> {
		let signer: string | undefined
		try {
			signer = await this.getFrom()
			return await signTypedData(this.send, signer, data)
		} catch (error) {
			throw new EthereumProviderError({
				...await getCommonErrorData(this.config),
				method: "Web3Ethereum.signTypedData",
				error,
				data,
			})
		}
	}

	async getFrom(): Promise<string> {
		try {
			return await getFrom(this.config.web3, this.config.from)
		} catch (error) {
			throw new EthereumProviderError({
				...await getCommonErrorData(this.config),
				method: "Web3Ethereum.getFrom",
				error,
				data: null,
			})
		}
	}

	encodeParameter(type: any, parameter: any): string {
		try {
		  return this.config.web3.eth.abi.encodeParameter(type, parameter)
		} catch (error) {
			throw new EthereumProviderError({
				...getProvidersData(this.config),
				method: "Web3Ethereum.encodeParameter",
				error,
				data: { type, parameter },
			})
		}
	}

	decodeParameter(type: any, data: string): any {
		try {
		  return this.config.web3.eth.abi.decodeParameters([type], data)
		} catch (error) {
			throw new EthereumProviderError({
				...getProvidersData(this.config),
				method: "Web3Ethereum.decodeParameter",
				error,
				data: { type, data },
			})
		}
	}

	async getBalance(address: Address): Promise<BigNumber> {
		try {
		  return toBigNumber(await this.config.web3.eth.getBalance(address))
		} catch (error) {
			throw new EthereumProviderError({
				...await getCommonErrorData(this.config),
				method: "Web3Ethereum.getBalance",
				error,
				data: { address },
			})
		}
	}

	async getChainId(): Promise<number> {
		try {
		  return +(await this.config.web3.eth.getChainId())
		} catch (error) {
			throw new EthereumProviderError({
				...getProvidersData(this.config),
				method: "Web3Ethereum.getChainId",
				error,
				data: null,
			})
		}
	}

	getWeb3Instance(): Web3 {
		return this.config.web3
	}

	getCurrentProvider(): any {
		return this.config.web3.currentProvider
	}
}

export class Web3Contract implements EthereumProvider.EthereumContract {
	constructor(private readonly config: Web3EthereumConfig, private readonly contract: Contract) {}

	functionCall(name: string, ...args: any): EthereumProvider.EthereumFunctionCall {
		return new Web3FunctionCall(
			this.config, this.contract, name, args,
		)
	}
}

export class Web3FunctionCall implements EthereumProvider.EthereumFunctionCall {
	private readonly sendMethod: ContractSendMethod
	private readonly contractAddress: Address

	constructor(
		private readonly config: Web3EthereumConfig,
		private readonly contract: Contract,
		private readonly methodName: string,
		private readonly args: any[],
	) {
		try {
			this.sendMethod = this.contract.methods[this.methodName](...this.args)
			this.contractAddress = toAddress(this.contract.options.address)
		} catch (error) {
			throw new EthereumProviderError({
				...getProvidersData(this.config),
				method: "Web3FunctionCall.constructor",
				error,
				data: {
					contract: this.contract.options.address,
					methodName: this.methodName,
					args: this.args,
				},
			})
		}
	}

	async getCallInfo(): Promise<EthereumProvider.EthereumFunctionCallInfo> {
		return {
			method: this.methodName,
			contract: this.contract.options.address,
			args: this.args,
			from: await this.getFrom(),
			provider: Provider.WEB3,
		}
	}

	async getData(): Promise<string> {
		try {
		  return await this.sendMethod.encodeABI()
		} catch (error) {
			throw new EthereumProviderError({
				...await getCommonErrorData(this.config),
				method: "Web3FunctionCall.getData",
				error,
				data: {
					contract: this.contract.options.address,
					methodName: this.methodName,
					args: this.args,
				},
			})
		}
	}

	async estimateGas(options: EthereumProvider.EthereumEstimateGasOptions = {}) {
		try {
		  return await this.sendMethod.estimateGas(options)
		} catch (error) {
			throw new EthereumProviderError({
				...await getCommonErrorData(this.config),
				method: "Web3FunctionCall.estimateGas",
				error,
				data: { options },
			})
		}
	}

	async call(options: EthereumProvider.EthereumSendOptions = {}): Promise<any> {
		let gasOptions: Web3EthereumGasOptions | undefined
		try {
			gasOptions = this.getGasOptions(options)
			return await this.sendMethod.call({
				from: this.config.from,
				...gasOptions,
			})
		} catch (error) {
			let info = null
			let data = null
			try {
				[info, data] = await promiseSettledRequest([
					this.getCallInfo(),
					this.getData(),
				])
			} catch (_) {}
			throw new EthereumProviderError({
				...await getCommonErrorData(this.config),
				method: "Web3FunctionCall.call",
				error,
				data: {
					...(info || {}),
					data,
					options,
					gasOptions,
				},
			})
		}
	}

	private async _send(
		options: EthereumProvider.EthereumSendOptions = {},
		gasOptions = this.getGasOptions(options)
	): Promise<EthereumProvider.EthereumTransaction> {
		const [callInfo, chainId] = await Promise.all([this.getCallInfo(), this.config.web3.eth.getChainId()])
		let hash: string | undefined
		let data: string | undefined

		try {
			data = await this.getData()
			const from = toAddress(callInfo.from)

			if (options.additionalData) {
				const additionalData = toBinary(options.additionalData).slice(2)
				const sourceData = toBinary(data).slice(2)
				const enhancedData = `0x${sourceData}${additionalData}`
				const transactionOptions: TransactionConfig = {
					from,
					to: this.contractAddress,
					data: enhancedData,
					value: options.value,
					...gasOptions,
				}
				const promiEvent = this.config.web3.eth.sendTransaction(transactionOptions)
				const promises = toPromises(promiEvent)
				const transaction = await this.getTransaction(await promises.hash)

				return new Web3Transaction(
					promises.receipt,
					toWord(transaction.hash),
					toBinary(enhancedData),
					transaction.nonce,
					from,
					this.contractAddress,
					this.contract.options.jsonInterface
				)
			}

			const sendMethodConfig: SendOptions = {
				from,
				value: options.value,
				...gasOptions,
			}
			const promiEvent: PromiEvent<Contract> = this.sendMethod.send(sendMethodConfig)
			const promises = toPromises(promiEvent)
			const transaction = await this.getTransaction(await promises.hash)
			return new Web3Transaction(
				promises.receipt,
				toWord(transaction.hash),
				toBinary(data),
				transaction.nonce,
				from,
				this.contractAddress
			)
		} catch (error) {
			throw new EthereumProviderError({
				...getProvidersData(this.config),
				method: "Web3FunctionCall.send",
				error,
				chainId,
				data: {
					...callInfo,
					options,
					gasOptions,
					data,
					hash,
				},
			})
		}

	}

	async send(options: EthereumProvider.EthereumSendOptions = {}): Promise<EthereumProvider.EthereumTransaction> {
		try {
			return await this._send(options)
		} catch (e) {
			//todo remove this hack for Phantom wallet after fixing issue with gasPrice=null for web3/Metamask
			if (hasMessage(e) && e?.message.toLowerCase().includes("missing or invalid parameters")) {
				return await this._send(options, {})
			}
			throw e
		}
	}

	private getGasOptions(options: EthereumProvider.EthereumSendOptions) {
		const gasOptions: Web3EthereumGasOptions = {
			// If we won't setup null here explicitly sometimes MetaMask
			// interpret this option as 'suggested by website' in their UI
			// @see https://stackoverflow.com/questions/68926306/how-to-avoid-this-gas-fee-has-been-suggested-by-message-in-metamask-using-web3
			gasPrice: null as unknown as Web3EthereumGasOptions["gasPrice"],
		}
		const gasPrice = options.gasPrice?.toString() || this.config.gasPrice
		if (typeof gasPrice !== "undefined") gasOptions.gasPrice = gasPrice
		const gas = options.gas || this.config.gas
		if (typeof gas !== "undefined") gasOptions.gas = gas
		return gasOptions
	}

	private getTransaction(hash: string) {
		return backOff(async () => {
			const value = await this.config.web3.eth.getTransaction(hash)
			if (!value) throw new Error("No transaction found")
			return value
		}, {
			maxDelay: 5000,
			numOfAttempts: 10,
			delayFirstAttempt: true,
			startingDelay: 300,
		})
	}

	async getFrom(): Promise<string> {
		return getFrom(this.config.web3, this.config.from)
	}
}

export class Web3Transaction implements EthereumProvider.EthereumTransaction {
	constructor(
		private readonly receipt: Promise<TransactionReceipt>,
		public readonly hash: Word,
		public readonly data: Binary,
		public readonly nonce: number,
		public readonly from: Address,
		public readonly to?: Address,
		private readonly contractAbi?: AbiItem[],
	) {}

	async wait(): Promise<EthereumProvider.EthereumTransactionReceipt> {
		try {
		  return await this.receipt
		} catch (error) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				method: "Web3Transaction.wait",
				error,
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

	async getEvents(): Promise<EthereumProvider.EthereumTransactionEvent[]> {
		await this.wait()
		if (this.to && this.contractAbi) {
			return getTransactionReceiptEvents(
				this.receipt,
				this.to,
				this.contractAbi
			)
		}
		return await getContractMethodReceiptEvents(this.receipt) || []
	}
}

async function getFrom(web3: Web3, from: string | undefined): Promise<string> {
	if (from) return from
	const [first] = await web3.eth.getAccounts()
	if (!first) throw new Error("Wallet is not connected")
	return first
}

async function getCommonErrorData(config: Web3EthereumConfig) {
	const [signer, chainId] = await promiseSettledRequest([
		getFrom(config.web3, config.from),
		config.web3.eth.getChainId(),
	])
	return {
		...getProvidersData(config),
		chainId,
		signer,
	}
}

function getProvidersData(config: Web3EthereumConfig) {
	return {
		provider: Provider.WEB3,
		providerId: getCurrentProviderId(config.web3),
	}
}

export function getCurrentProviderId(web3: Web3 | undefined): DappType {
	if (web3) return getDappType(web3.currentProvider) || DappType.Unknown
	return DappType.Unknown
}
