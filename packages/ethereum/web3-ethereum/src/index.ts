import type { Contract, ContractSendMethod } from "web3-eth-contract"
import type Web3 from "web3"
import type { PromiEvent, TransactionReceipt } from "web3-core"
import { Provider, signTypedData } from "@rarible/ethereum-provider"
import type { MessageTypes, TypedMessage } from "@rarible/ethereum-provider"
import type { Address, BigNumber, Binary, Word } from "@rarible/types"
import { toAddress, toBigNumber, toBinary, toWord } from "@rarible/types"
import { backOff } from "exponential-backoff"
import type * as EthereumProvider from "@rarible/ethereum-provider"
import type { AbiItem } from "web3-utils"
import { EthereumProviderError } from "@rarible/ethereum-provider"
import { filterErrors } from "@rarible/ethereum-provider"
import { getDappType } from "@rarible/sdk-common"
import type { Web3EthereumConfig } from "./domain"
import { providerRequest } from "./utils/provider-request"
import { toPromises } from "./utils/to-promises"
import {
	getContractMethodReceiptEvents,
	getTransactionReceiptEvents,
} from "./utils/log-parser"

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
		} catch (e: any) {
			let signer: string | undefined, chainId
			try {
				[signer, chainId] = await Promise.all([
					this.getFrom(),
					this.getChainId(),
				])
			} catch (e) {}
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				error: e,
				code: e?.code,
				method: "Web3Ethereum.send",
				chainId,
				data: {
					method,
					params,
					from: signer,
				},
			})
		}
	}

	async personalSign(message: string): Promise<string> {
		let signer: string | undefined
		try {
			signer = await this.getFrom()
			const signature = await (this.config.web3.eth.personal as any).sign(message, signer)
			filterErrors(signature)
			return signature
		} catch (e: any) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				error: e,
				code: e?.code,
				method: "Web3Ethereum.personalSign",
				data: {
					message,
					signer,
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
			let chainId
			try {
				chainId = await this.getChainId()
			} catch (e) {}
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				method: "Web3Ethereum.signTypedData",
				error: e,
				code: e.code,
				data,
				signer,
				chainId,
			})
		}
	}

	async getFrom(): Promise<string> {
		try {
			return await getFrom(this.config.web3, this.config.from)
		} catch (e) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				method: "Web3Ethereum.getFrom",
				error: e,
				data: null,
			})
		}
	}

	encodeParameter(type: any, parameter: any): string {
		try {
		  return this.config.web3.eth.abi.encodeParameter(type, parameter)
		} catch (e: any) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				method: "Web3Ethereum.encodeParameter",
				code: e?.code,
				error: e,
				data: { type, parameter },
			})
		}
	}

	decodeParameter(type: any, data: string): any {
		try {
		  return this.config.web3.eth.abi.decodeParameters([type], data)
		} catch (e: any) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				method: "Web3Ethereum.decodeParameter",
				error: e,
				code: e?.code,
				data: { type, data },
			})
		}
	}

	async getBalance(address: Address): Promise<BigNumber> {
		try {
		  return toBigNumber(await this.config.web3.eth.getBalance(address))
		} catch (e: any) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				method: "Web3Ethereum.getBalance",
				error: e,
				code: e?.code,
				data: { address },
			})
		}
	}

	async getChainId(): Promise<number> {
		try {
		  return await this.config.web3.eth.getChainId()
		} catch (e) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				method: "Web3Ethereum.getChainId",
				error: e,
				data: null,
			})
		}
	}

	getWeb3Instance(): Web3 {
		return this.config.web3
	}
}

export class Web3Contract implements EthereumProvider.EthereumContract {
	constructor(private readonly config: Web3EthereumConfig, private readonly contract: Contract) {
	}

	functionCall(name: string, ...args: any): EthereumProvider.EthereumFunctionCall {
		return new Web3FunctionCall(
			this.config, this.contract, name, args,
		)
	}
}

export class Web3FunctionCall implements EthereumProvider.EthereumFunctionCall {
	private readonly sendMethod: ContractSendMethod

	constructor(
		private readonly config: Web3EthereumConfig,
		private readonly contract: Contract,
		private readonly methodName: string,
		private readonly args: any[],
	) {
		try {
		  this.sendMethod = this.contract.methods[this.methodName](...this.args)
		} catch (e: any) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				method: "Web3FunctionCall.constructor",
				error: e,
				code: e?.code,
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
		} catch (e) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				method: "Web3FunctionCall.getData",
				error: e,
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
		} catch (e) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				method: "Web3FunctionCall.estimateGas",
				error: e,
				data: { options },
			})
		}
	}

	async call(options: EthereumProvider.EthereumSendOptions = {}): Promise<any> {
		try {
			return await this.sendMethod.call({
				from: this.config.from,
				gas: options.gas,
				gasPrice: options.gasPrice?.toString(),
			})
		} catch (e: any) {
			let callInfo = null, callData = null, chainId
			try {
				[callInfo, callData, chainId] = await Promise.all([
					this.getCallInfo(),
					this.getData(),
					this.config.web3.eth.getChainId(),
				])
			} catch (e) {}
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				method: "Web3FunctionCall.call",
				error: e,
				code: e?.code,
				chainId,
				data: {
					...(callInfo || {}),
					data: callData,
					options,
				},
			})
		}
	}

	async send(options: EthereumProvider.EthereumSendOptions = {}): Promise<EthereumProvider.EthereumTransaction> {
		let hashValue: string | undefined
		try {
			const from = toAddress(await this.getFrom())
			if (options.additionalData) {
				const additionalData = toBinary(options.additionalData).slice(2)
				const sourceData = toBinary(await this.getData()).slice(2)

				const data = `0x${sourceData}${additionalData}`
				const promiEvent = this.config.web3.eth.sendTransaction({
					from,
					to: this.contract.options.address,
					data,
					gas: this.config.gas || options.gas,
					value: options.value,
					gasPrice: options.gasPrice?.toString(),
				})
				const { hash, receipt } = toPromises(promiEvent)
				hashValue = await hash
				const tx = await this.getTransaction(hashValue)

				return new Web3Transaction(
					receipt,
					toWord(hashValue),
					toBinary(data),
					tx.nonce,
					from,
					toAddress(this.contract.options.address),
					this.contract.options.jsonInterface
				)
			}

			const promiEvent: PromiEvent<Contract> = this.sendMethod.send({
				from,
				gas: this.config.gas || options.gas,
				value: options.value,
				gasPrice: options.gasPrice?.toString(),
			})
			const { hash, receipt } = toPromises(promiEvent)
			hashValue = await hash
			const tx = await this.getTransaction(hashValue)
			return new Web3Transaction(
				receipt,
				toWord(hashValue),
				toBinary(await this.getData()),
				tx.nonce,
				from,
				toAddress(this.contract.options.address)
			)
		} catch (e: any) {
			let callInfo = null, callData = null, chainId
			try {
				[callInfo, callData, chainId] = await Promise.all([
					this.getCallInfo(),
					this.getData(),
					this.config.web3.eth.getChainId(),
				])
			} catch (e) {}
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				providerId: getDappType(this.config.web3.currentProvider),
				method: "Web3FunctionCall.send",
				error: e,
				code: e?.code,
				chainId,
				data: {
					...(callInfo || {}),
					options,
					data: callData,
					hash: hashValue,
					gas: this.config.gas || options.gas,
				},
			})
		}

	}

	private getTransaction(hash: string) {
		return backOff(async () => {
			const value = await this.config.web3.eth.getTransaction(hash)
			if (!value) {
				throw new Error("No transaction found")
			}
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
		} catch (e: any) {
			throw new EthereumProviderError({
				provider: Provider.WEB3,
				method: "Web3Transaction.wait",
				error: e,
				code: e?.code,
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
	if (from) {
		return from
	}
	const [first] = await web3.eth.getAccounts()
	if (!first) {
		throw new Error("Wallet is not connected")
	}
	return first
}
