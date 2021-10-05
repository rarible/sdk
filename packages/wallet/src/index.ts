import type { Ethereum } from "@rarible/ethereum-provider"
import { BlockchainTypeEnum, EthereumAddress, EthereumNetwork, FlowAddress, FlowNetwork, toEthereumAddress, toFlowAddress } from "packages/types/build"

interface AbstractWallet {
	blockchain: BlockchainTypeEnum
	signPersonalMessage(message: string): Promise<string>
}

export class EthereumWallet implements AbstractWallet {
	readonly address: EthereumAddress = toEthereumAddress(this.addressRaw)
	readonly blockchain = BlockchainTypeEnum.ETHEREUM

	constructor(
		public readonly ethereum: Ethereum,
		private readonly addressRaw: string,
		public readonly network: EthereumNetwork
	) {}

	signPersonalMessage(message: string): Promise<string> {
		return this.ethereum.personalSign(message)
	}
}

export class FlowWallet implements AbstractWallet {
	readonly address: FlowAddress = toFlowAddress(this.addressRaw)
	readonly blockchain = BlockchainTypeEnum.FLOW

	constructor(
		public readonly fcl: any,
		private readonly addressRaw: string,
		public readonly network: FlowNetwork
	) {}

	signPersonalMessage(message: string): Promise<string> {
		// @todo implement
		return Promise.resolve(message)
	}
}

export type BlockchainWallet = EthereumWallet | FlowWallet
