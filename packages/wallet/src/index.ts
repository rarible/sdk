import type { Ethereum } from "@rarible/ethereum-provider"
import type { Blockchain, UnionAddress } from "@rarible/api-client"
import { Provider } from "tezos-sdk-module/dist/common/base"

// @todo replace with types from ethereum-sdk, flow-sdk etc

export type EthereumNetwork = "mainnet" | "ropsten" | "rinkeby" | "e2e"
export type FlowNetwork = "mainnet" | "testnet"
export type TezosNetwork = "mainnet" | "granada" | "local"

interface AbstractWallet {
	blockchain: Blockchain
	address: UnionAddress

	signPersonalMessage(message: string): Promise<string>
}

export class EthereumWallet implements AbstractWallet {
	readonly blockchain = "ETHEREUM"

	constructor(
		public readonly ethereum: Ethereum,
		public readonly address: UnionAddress,
	) {
	}

	signPersonalMessage(message: string): Promise<string> {
		return this.ethereum.personalSign(message)
	}
}

export class FlowWallet implements AbstractWallet {
	readonly blockchain = "FLOW"

	constructor(
		public readonly fcl: any,
		public readonly address: UnionAddress,
		public readonly network: FlowNetwork,
	) {
	}

	signPersonalMessage(message: string): Promise<string> {
		// @todo implement
		return Promise.resolve(message)
	}
}

export class TezosWallet implements AbstractWallet {
	readonly blockchain = "TEZOS"

	constructor(
		public readonly provider: Provider,
		public readonly address: UnionAddress,
	) {
	}

	signPersonalMessage(message: string): Promise<string> {
		// return this.ethereum.personalSign(message)
		// @todo implement
		return Promise.resolve(message)
	}
}

export type BlockchainWallet = EthereumWallet | FlowWallet | TezosWallet
