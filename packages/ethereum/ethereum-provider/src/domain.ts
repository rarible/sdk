import type { TypedMessage as EthSigUtilTypedData } from "eth-sig-util"
import type { Binary } from "@rarible/types"

export enum SignTypedDataMethodEnum {
	V4 = "eth_signTypedData_v4",
	V3 = "eth_signTypedData_v3",
	DEFAULT = "eth_signTypedData"
}

export type MessageTypeProperty = {
	name: string;
	type: string;
}

export type MessageTypes = {
	EIP712Domain: MessageTypeProperty[];
	[additionalProperties: string]: MessageTypeProperty[];
}

export type TypedMessage<T extends MessageTypes> = EthSigUtilTypedData<T>

export interface EthereumSendOptions {
	value?: number | string
	gas?: number
	gasPrice?: number
	additionalData?: Binary
}

export interface EthereumEstimateGasOptions {
	from?: string
	value?: number | string
}

export interface EthereumFunctionCallInfo {
	method: string
	args: any[]
	contract: string
	from: string
	provider?: string
}

export enum Provider {
	WEB3 = "web3",
	ETHERS = "ethers"
}
