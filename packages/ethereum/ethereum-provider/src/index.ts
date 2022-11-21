import type { Address, BigNumber, Binary, Word } from "@rarible/types"
import type {
	EthereumEstimateGasOptions,
	EthereumFunctionCallInfo,
	EthereumSendOptions,
	MessageTypes,
	TypedMessage,
} from "./domain"

export type EthereumTransactionEvent = {
	event: string,
	address: string
	args: any
	returnValues?: any
	logIndex: number
	transactionIndex: number
	transactionHash: string
	blockHash: string
}

export type EthereumTransactionReceipt = {
	to: string
	from: string
	contractAddress?: string
	status: boolean
	transactionIndex: number
	transactionHash: string
	blockHash: string
	blockNumber: number
}

export interface EthereumTransaction {
	hash: Word
	from: Address
	to?: Address
	data: Binary
	nonce: number
	wait(): Promise<EthereumTransactionReceipt>
	getEvents(): Promise<EthereumTransactionEvent[]>
}

export interface EthereumFunctionCall {
	getData(): Promise<string>
	getCallInfo(): Promise<EthereumFunctionCallInfo>
	estimateGas(options?: EthereumEstimateGasOptions): Promise<number>
	call(options?: EthereumSendOptions): Promise<any>
	send(options?: EthereumSendOptions): Promise<EthereumTransaction>
}

export interface EthereumContract {
	functionCall(name: string, ...args: any): EthereumFunctionCall
}

export interface Ethereum {
	createContract(abi: any, address?: string): EthereumContract
	getFrom(): Promise<string>
	personalSign(message: string): Promise<string>
	signTypedData<T extends MessageTypes>(data: TypedMessage<T>): Promise<string>
	encodeParameter(type: any, parameter: any): string
	decodeParameter(type: any, data: string): any
	getBalance(address: Address): Promise<BigNumber>
	getChainId(): Promise<number>
}

export * from "./domain"
export * from "./errors"
export { signTypedData } from "./sign-typed-data"
export type {
	EthereumEstimateGasOptions,
	EthereumFunctionCallInfo,
	EthereumSendOptions,
	MessageTypes,
	TypedMessage,
}
