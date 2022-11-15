import type { Contract } from "ethers"
import { ethers } from "ethers"
import type { TransactionResponse } from "@ethersproject/abstract-provider"
import type * as EthereumProvider from "@rarible/ethereum-provider"
import { Provider, signTypedData } from "@rarible/ethereum-provider"
import type { Address, Binary, BigNumber, Word } from "@rarible/types"
import { toAddress, toBigNumber, toBinary, toWord } from "@rarible/types"
import type { MessageTypes, TypedMessage, EthereumTransactionEvent } from "@rarible/ethereum-provider"
import type { TypedDataSigner } from "@ethersproject/abstract-signer"
import { BigNumber as EthersBN } from "ethers/lib/ethers"
import { EthereumProviderError } from "@rarible/ethereum-provider"
import { decodeParameters, encodeParameters } from "./abi-coder"
import { getTxEvents } from "./utils/parse-logs"

export class EthersWeb3ProviderEthereum implements EthereumProvider.Ethereum {
	constructor(readonly web3Provider: ethers.providers.Web3Provider, readonly from?: string) {
		this.send = this.send.bind(this)
	}

	createContract(abi: any, address?: string): EthereumProvider.EthereumContract {
		if (!address) {
			throw new Error("No Contract address provided, it's required for EthersEthereum")
		}
		return new EthersContract(
			new ethers.Contract(address, abi, this.web3Provider.getSigner()),
			this.web3Provider.getSigner()
		)
	}

	async send(method: string, params: any): Promise<any> {
		try {
		  return this.web3Provider.send(method, params)
		} catch (e) {
			throw new EthereumProviderError({
				provider: Provider.ETHERS,
				method: "EthersWeb3ProviderEthereum.send",
				error: e,
				data: {
					method,
					params,
					from: await this.getFrom(),
				},
			})
		}
	}

	personalSign(message: string): Promise<string> {
		return this.web3Provider.getSigner().signMessage(message)
	}

	async signTypedData<T extends MessageTypes>(data: TypedMessage<T>): Promise<string> {
		let signer: string | undefined
		try {
			signer = await this.getFrom()
			return signTypedData(this.send, signer, data)
		} catch (e) {
			throw new EthereumProviderError({
				provider: Provider.ETHERS,
				method: "EthersWeb3ProviderEthereum.signTypedData",
				error: e,
				data,
				signer,
			})
		}
	}

	async getFrom(): Promise<string> {
		if (!this.from) {
			const [first] = await this.web3Provider.listAccounts()
			return first
		}
		return this.from
	}

	encodeParameter(type: any, parameter: any): string {
		try {
		  return encodeParameters([type], [parameter])
		} catch (e) {
			throw new EthereumProviderError({
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
		} catch (e) {
			throw new EthereumProviderError({
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
		} catch (e) {
			throw new EthereumProviderError({
				provider: Provider.ETHERS,
				method: "EthersWeb3ProviderEthereum.getBalance",
				error: e,
				data: { address },
			})
		}
	}

	async getChainId(): Promise<number> {
		const { chainId } = await this.web3Provider.getNetwork()
		return chainId
	}
}

export class EthersEthereum implements EthereumProvider.Ethereum {
	constructor(readonly signer: TypedDataSigner & ethers.Signer) {}

	createContract(abi: any, address?: string): EthereumProvider.EthereumContract {
		if (!address) {
			throw new Error("No Contract address provided, it's required for EthersEthereum")
		}
		return new EthersContract(new ethers.Contract(address, abi, this.signer), this.signer)
	}

	personalSign(message: string): Promise<string> {
		return this.signer.signMessage(message)
	}

	async signTypedData<T extends MessageTypes>(data: TypedMessage<T>): Promise<string> {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { EIP712Domain, ...types } = data.types
			return this.signer._signTypedData(data.domain, types, data.message)
		} catch (e) {
			throw new EthereumProviderError({
				provider: Provider.ETHERS,
				method: "EthersEthereum.signTypedData",
				error: e,
				data,
			})
		}
	}

	getFrom(): Promise<string> {
		return this.signer.getAddress()
	}

	encodeParameter(type: any, parameter: any): string {
		try {
		  return encodeParameters([type], [parameter])
		} catch (e) {
			throw new EthereumProviderError({
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
		} catch (e) {
			throw new EthereumProviderError({
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
		} catch (e) {
			throw new EthereumProviderError({
				provider: Provider.ETHERS,
				method: "EthersEthereum.getBalance",
				error: e,
				data: { address },
			})
		}
	}

	async getChainId(): Promise<number> {
		return this.signer.getChainId()
	}
}

export class EthersContract implements EthereumProvider.EthereumContract {
	constructor(
		private readonly contract: Contract,
		private readonly signer: TypedDataSigner & ethers.Signer
	) {
	}

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
		return {
			method: this.name,
			args: this.args,
			contract: this.contract.address,
			from: await this.signer.getAddress(),
			provider: Provider.ETHERS,
		}
	}

	async getData(): Promise<string> {
		try {
		  return (await this.contract.populateTransaction[this.name](...this.args)).data || "0x"
		} catch (e) {
			throw new EthereumProviderError({
				provider: Provider.ETHERS,
				method: "EthersFunctionCall.getData",
				error: e,
				data: {
					args: this.args,
					name: this.name,
					contract: this.contract.address,
				},
			})
		}
	}

	async estimateGas(options?: EthereumProvider.EthereumSendOptions) {
		const func = this.contract.estimateGas[this.name].bind(null, ...this.args)
		const value = await func(options)
		return value.toNumber()
	}

	call(options?: EthereumProvider.EthereumSendOptions): Promise<any> {
		const func = this.contract[this.name].bind(null, ...this.args)
		if (options) {
			return func(options)
		} else {
			return func()
		}
	}

	async send(options?: EthereumProvider.EthereumSendOptions): Promise<EthereumProvider.EthereumTransaction> {
		let hashValue: string | undefined
		try {
			if (options?.additionalData) {
				const additionalData = toBinary(options.additionalData).slice(2)
				const sourceData = toBinary(await this.getData()).slice(2)

				const tx = await this.signer.sendTransaction({
					from: await this.signer.getAddress(),
					to: this.contract.address,
					data: `0x${sourceData}${additionalData}`,
					gasLimit: options.gas,
					gasPrice: options.gasPrice,
					value: options.value !== undefined ? ethers.utils.hexValue(EthersBN.from(options.value)) : undefined,
				})

				return new EthersTransaction(
					tx,
					this.contract
				)
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
		} catch (e) {
			throw new EthereumProviderError({
				provider: Provider.ETHERS,
				method: "EthersFunctionCall.send",
				error: e,
				data: {
					...(await this.getCallInfo()),
					data: await this.getData(),
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
		private readonly contract?: Contract
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
		} catch (e) {
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
		} catch (e) {
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
