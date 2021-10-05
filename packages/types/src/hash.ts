
export type FlowTransactionHash = string & { __TX_FLOW_HASH__: true }
export type EthereumTransactionHash = string & { __TX_ETHEREUM_HASH__: true }
export type BlockchainTransactionHash = FlowTransactionHash | EthereumTransactionHash

export function toFlowHash(string: string): FlowTransactionHash {
	(string as FlowTransactionHash).__TX_FLOW_HASH__ = true
	return string as FlowTransactionHash
}

export function toEthereumHash(string: string): EthereumTransactionHash {
	(string as EthereumTransactionHash).__TX_ETHEREUM_HASH__ = true
	return string as EthereumTransactionHash
}