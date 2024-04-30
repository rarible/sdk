import Web3 from "web3"
import type { types, eth, ContractAbi } from "web3"
import type * as EthereumProvider from "@rarible/ethereum-provider"
import type { MessageTypes, TypedMessage } from "@rarible/ethereum-provider"
import { EthereumProviderError, filterErrors, Provider, signTypedData } from "@rarible/ethereum-provider"
import type { Address, BigNumber, Binary, Word } from "@rarible/types"
import { toAddress, toBigNumber, toBinary, toWord } from "@rarible/types"
import {
	DappType,
	getDappType,
	promiseSettledRequest,
	conditionalRetry,
	FAILED_TO_FETCH_ERROR,
	deepReplaceBigInt,
	hasVersion,
	getMajorVersion,
	isObjectLike,
	isFunctionLike,
} from "@rarible/sdk-common"
import { hasMessage } from "@rarible/ethereum-provider/build/sign-typed-data"
import { FMT_BYTES, FMT_NUMBER } from "web3-types"
import type { AbiFunctionFragment, FilterAbis, Transaction } from "web3-types"
import type { ContractMethodsInterface, NonPayableMethodObject, PayableMethodObject } from "web3-eth-contract"
import type { Web3EthereumConfig } from "./domain"
import { providerRequest } from "./utils/provider-request"
import { toPromises } from "./utils/to-promises"
import { getTransactionReceiptEvents } from "./utils/log-parser"
import type { SendTxResult } from "./domain"
import type { TxReceiptNumberFormatted } from "./domain"
import { NumberDataFormat } from "./domain"

export class Web3v4Ethereum implements EthereumProvider.Ethereum {
	constructor(private readonly config: Web3EthereumConfig) {
		if (!Web3v4Ethereum.isWeb3v4(config.web3)) {
			throw new Error(`Passed version web3=${getWeb3Version(config.web3)}, expected v4`)
		}
		this.send = this.send.bind(this)
		this.getFrom = this.getFrom.bind(this)
	}

	static isWeb3v4(x: unknown): x is Web3 {
		const version = getWeb3Version(x)
		if (!version) return false
		return getMajorVersion(version) === "4"
	}

	createContract(abi: any, address?: string): EthereumProvider.EthereumContract {
		return new Web3Contract(this.config, new this.config.web3.eth.Contract(abi, address, NumberDataFormat))
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
			const signature = await (this.config.web3.eth.personal as any).sign(message, signer.toLowerCase(), "")
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
		  const decodedData = this.config.web3.eth.abi.decodeParameters([type], data)
			//Remove fn when bigint will be removed from response
			return deepReplaceBigInt(decodedData)
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
			const amount = await conditionalRetry(5, 3000, async () =>
				toBigNumber(
					await this.config.web3.eth.getBalance(
						address,
						this.config.web3.eth.defaultBlock,
						{ number: FMT_NUMBER.STR, bytes: FMT_BYTES.HEX }
					)
				),
			error => error?.message === FAILED_TO_FETCH_ERROR
			)
		  return toBigNumber(amount)
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
		  return +(await this.config.web3.eth.getChainId(NumberDataFormat))
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

export class Web3Contract<Abi extends ContractAbi> implements EthereumProvider.EthereumContract {
	constructor(
		private readonly config: Web3EthereumConfig,
		private readonly contract: eth.contract.Contract<Abi>) {}

	functionCall(
		name: FilterAbis<Abi, AbiFunctionFragment & { type: "function" }>["name"],
		...args: any
	): EthereumProvider.EthereumFunctionCall {
		return new Web3FunctionCall(
			this.config, this.contract, name, args,
		)
	}
}

export class Web3FunctionCall<
	Abi extends ContractAbi,
	Contract extends eth.contract.Contract<Abi> = eth.contract.Contract<Abi>,
>
implements EthereumProvider.EthereumFunctionCall {
	private readonly sendMethod: PayableMethodObject<any, any> | NonPayableMethodObject<any, any>
	private readonly contractAddress: Address

	constructor(
		private readonly config: Web3EthereumConfig,
		private readonly contract: Contract,
		private readonly methodName: FilterAbis<Abi, AbiFunctionFragment & { type: "function" }>["name"],
		private readonly args: Parameters<ContractMethodsInterface<Abi>["name"]>,
	) {
		try {
			this.sendMethod = this.contract.methods[this.methodName].apply(null, args)
			// console.log("this.sendMethod", this.sendMethod)
			if (!this.contract.options.address) {
				throw new Error("Contract address is undefined")
			}
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
			contract: this.contractAddress,
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
			return await conditionalRetry(5, 3000, () =>
				this.sendMethod.estimateGas({
					...options,
					value: typeof options?.value === "number" ? options?.value.toFixed() : options?.value,
				}, NumberDataFormat),
			(error) => error?.message === FAILED_TO_FETCH_ERROR)
		} catch (error) {
			let callInfo = null, data = null, chainId = undefined
			try {
				[callInfo, chainId, data] = await promiseSettledRequest([
					this.getCallInfo(),
					this.config.web3.eth.getChainId(NumberDataFormat),
					await this.getData(),
				])
			} catch (_) {}
			throw new EthereumProviderError({
				...await getCommonErrorData(this.config),
				method: "Web3FunctionCall.estimateGas",
				chainId,
				error,
				data: {
					...callInfo,
					options,
					data,
				},
			})
		}
	}

	async call(options: EthereumProvider.EthereumSendOptions = {}): Promise<any> {
		let gasOptions: InternalGasOptions | undefined
		try {
			gasOptions = this.getGasOptions(options)
			return await conditionalRetry(5, 3000, async () => {
				const result = await this.sendMethod.call({
					from: this.config.from,
					...gasOptions,
				})
				return deepReplaceBigInt(result)
			},
			(error) => error?.message === FAILED_TO_FETCH_ERROR
			)
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
		const [callInfo, chainId] = await Promise.all([
			this.getCallInfo(),
			this.config.web3.eth.getChainId(NumberDataFormat),
		])
		let hash: string | undefined
		let data: string | undefined

		try {
			data = await this.getData()
			gasOptions = this.getGasOptions(options)
			const from = toAddress(callInfo.from)

			const additionalData = typeof options.additionalData !== "undefined"
				? toBinary(options.additionalData).slice(2)
				: ""
			const sourceData = toBinary(data).slice(2)
			const enhancedData = `0x${sourceData}${additionalData}`
			const transactionOptions: Transaction = {
				from,
				to: this.contractAddress,
				data: enhancedData,
				value: options.value,
				...gasOptions,
			}

			const promiEvent = this.config.web3.eth.sendTransaction(
				transactionOptions,
				NumberDataFormat,
				{
					contractAbi: this.contract.options.jsonInterface,
					checkRevertBeforeSending: true,
				}
			)
			const promises = toPromises(promiEvent as SendTxResult)

			return new Web3Transaction(
				promises.receipt,
				toWord(await promises.hash),
				toBinary(enhancedData),
				from,
				this.contractAddress,
				this.contract.options.jsonInterface
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
			if (hasMessage(e) && e?.message?.toLowerCase().includes("missing or invalid parameters")) {
				return await this._send(options, {})
			}
			throw e
		}
	}

	private getGasOptions(options: EthereumProvider.EthereumSendOptions) {
		const gasOptions: InternalGasOptions = {
			// If we won't setup null here explicitly sometimes MetaMask
			// interpret this option as 'suggested by website' in their UI
			// @see https://stackoverflow.com/questions/68926306/how-to-avoid-this-gas-fee-has-been-suggested-by-message-in-metamask-using-web3
			gasPrice: null as any,
		}
		const gasPrice = options.gasPrice?.toString() || this.config.gasPrice
		if (typeof gasPrice !== "undefined") gasOptions.gasPrice = gasPrice
		const gas = options.gas?.toFixed() || this.config.gas?.toFixed()
		if (typeof gas !== "undefined") gasOptions.gas = gas
		return gasOptions
	}

	async getFrom(): Promise<string> {
		return getFrom(this.config.web3, this.config.from)
	}
}

export class Web3Transaction implements EthereumProvider.EthereumTransaction {
	constructor(
		private readonly receipt: Promise<TxReceiptNumberFormatted>,
		public readonly hash: Word,
		public readonly data: Binary,
		public readonly from: Address,
		public readonly to?: Address,
		private readonly contractAbi?: types.ContractAbi,
	) {}

	async wait(): Promise<EthereumProvider.EthereumTransactionReceipt> {
		try {
		  const receipt = await this.receipt
			return {
				...receipt,
				status: !!receipt.status,
			}
		} catch (error) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				method: "Web3Transaction.wait",
				error,
				data: {
					hash: this.hash,
					data: this.data,
					from: this.from,
					to: this.to,
				},
			})
		}
	}

	async getEvents(): Promise<EthereumProvider.EthereumTransactionEvent[]> {
		await this.wait()
		const receipt = await this.receipt
		if (receipt.events) {
			return Object.values(receipt.events || {}).map(e => ({
				...e,
				logIndex: e.logIndex || 0,
				transactionIndex: e.transactionIndex || 0,
				transactionHash: e.transactionHash || "",
				blockHash: e.blockHash || "",
				args: e.returnValues,
			}))
		}
		if (this.to && this.contractAbi) {
			return getTransactionReceiptEvents(
				this.receipt,
				this.to,
				this.contractAbi
			)
		}
		throw new Error("getEvents: contract method does not exist")
	}
}

async function getFrom(web3: Web3, from: string | undefined): Promise<string> {
	if (from) return from
	const [first] = await web3.eth.getAccounts()
	if (!first) throw new Error("Wallet is not connected")
	return first
}

async function getCommonErrorData(config: Web3EthereumConfig) {
	const [signer, chainId, blockNumber] = await promiseSettledRequest([
		getFrom(config.web3, config.from),
		config.web3.eth.getChainId(NumberDataFormat),
		config.web3.eth.getBlockNumber(NumberDataFormat),
	])
	return {
		...getProvidersData(config),
		chainId,
		signer,
		blockNumber,
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

type InternalGasOptions = { gas?: string, gasPrice?: string }

function getWeb3Version(x: unknown): string | undefined {
	if (!(isObjectLike(x) && isFunctionLike(x?.constructor) && hasVersionFnField(x.constructor))) return undefined
	return x.constructor.version
}

interface FunctionWithOptionalVersion extends Function {
	version: string;
}
function hasVersionFnField(fn: Function): fn is FunctionWithOptionalVersion {
	return "version" in fn
}

export { Web3, FMT_BYTES, FMT_NUMBER }
export { types as Web3Types } from "web3"
export * as Web3EthContractTypes from "web3-eth-contract"
