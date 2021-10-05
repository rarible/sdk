import { toAddress } from "@rarible/types"
import { BlockchainTypeEnum } from "."

export type FlowAddress = {
	type: BlockchainTypeEnum.FLOW
	value: string
}

export type EthereumAddress = {
	type: BlockchainTypeEnum.ETHEREUM
	value: string
}

export type BlockchainAddress = FlowAddress | EthereumAddress

export function toFlowAddress(address: string): FlowAddress {
	// @todo add processing if needed
	return {
		type: BlockchainTypeEnum.FLOW,
		value: address,
	}
}

export function toEthereumAddress(address: string): EthereumAddress {
	return {
		type: BlockchainTypeEnum.ETHEREUM,
		value: toAddress(address),
	}
}