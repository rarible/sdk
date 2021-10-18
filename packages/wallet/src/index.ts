import type { Ethereum } from "@rarible/ethereum-provider"
import type { Blockchain, UnionAddress } from "@rarible/api-client"
import { Provider } from "tezos-sdk-module/dist/common/base"

// @todo replace with types from ethereum-sdk, flow-sdk etc

export type EthereumNetwork = "mainnet" | "ropsten" | "rinkeby" | "e2e"
export type FlowNetwork = "mainnet" | "testnet"
export type TezosNetwork = "mainnet" | "granada" | "local"

interface AbstractWallet {
	blockchain: Blockchain

	signPersonalMessage(message: string): Promise<string>
}

export class EthereumWallet implements AbstractWallet {
	readonly blockchain = "ETHEREUM"

	constructor(
		public readonly ethereum: Ethereum,
		public readonly network: EthereumNetwork,
	) {
	}

	signPersonalMessage(message: string): Promise<string> {
		return this.ethereum.personalSign(message)
	}
}

//todo remove these type when it shipped from flow-sdk
interface CurrentUser {
	snapshot(): Promise<any>

	signUserMessage(message: string): Promise<Signature[]>
}

//todo remove these type when it shipped from flow-sdk
type Signature = {
	addr: string
	signature: string
}

export class FlowWallet implements AbstractWallet {
	readonly blockchain = "FLOW"

	constructor(
		public readonly fcl: any,
		public readonly address: UnionAddress,
		public readonly network: FlowNetwork,
	) {
	}

	async signPersonalMessage(message: string): Promise<string> {
		const currentUser: CurrentUser = this.fcl.currentUser()
		const userAddress = (await currentUser.snapshot()).addr
		const messageHex = Buffer.from(message).toString("hex")
		const signatures: Signature[] = await currentUser.signUserMessage(messageHex)
		if (signatures.length) {
			const signature = signatures.find(s => s.addr.toLowerCase() === userAddress.toLowerCase())?.signature
			if (signature) {
				return signature
			} else {
				throw Error(`Signature of user address "${userAddress}" not found`)
			}
		} else {
			throw Error("Response of signUserMessage is empty")
		}
	}
}

export class TezosWallet implements AbstractWallet {
	readonly blockchain = "TEZOS"

	constructor(
		public readonly provider: Provider,
	) {
	}

	signPersonalMessage(message: string): Promise<string> {
		// return this.ethereum.personalSign(message)
		// @todo implement
		return Promise.resolve(message)
	}
}

export type BlockchainWallet = EthereumWallet | FlowWallet | TezosWallet
