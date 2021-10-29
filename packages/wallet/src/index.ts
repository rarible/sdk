import type { Ethereum } from "@rarible/ethereum-provider"
import type { Blockchain, UnionAddress } from "@rarible/api-client"
import { Provider } from "tezos-sdk-module/dist/common/base"
import { Fcl } from "@rarible/fcl-types"

// @todo replace with types from ethereum-sdk, flow-sdk etc

export type EthereumNetwork = "mainnet" | "ropsten" | "rinkeby" | "e2e"
export type FlowNetwork = "mainnet" | "testnet"
export type TezosNetwork = "mainnet" | "granada" | "local"

type SignUserMessageResponse = {
	signature: string
}

interface AbstractWallet {
	blockchain: Blockchain
	address: UnionAddress

	signPersonalMessage(message: string): Promise<SignUserMessageResponse>
}

export class EthereumWallet implements AbstractWallet {
	readonly blockchain = "ETHEREUM"

	constructor(
		public readonly ethereum: Ethereum,
		public readonly address: UnionAddress,
	) {
	}

	async signPersonalMessage(message: string): Promise<SignUserMessageResponse> {
		return { signature: await this.ethereum.personalSign(message) }
	}
}

interface FlowSignedMessageResponse extends SignUserMessageResponse {
	pubKey: string
}

export class FlowWallet implements AbstractWallet {
	readonly blockchain = "FLOW"

	constructor(
		public readonly fcl: Fcl,
		public readonly address: UnionAddress,
		public readonly network: FlowNetwork,
	) {
	}

	async signPersonalMessage(message: string): Promise<FlowSignedMessageResponse> {
		if (!message.length) {
			throw Error("Message can't be empty")
		}
		const messageHex = Buffer.from(message).toString("hex")
		const currentUser = await this.fcl.currentUser()
		const { addr } = await currentUser.snapshot()
		const account = await this.fcl.account(addr)

		const signatures = await currentUser.signUserMessage(messageHex)
		if (typeof signatures === "string") {
			throw Error(signatures)
		}

		const signature = signatures.find(s => s.addr.toLowerCase() === addr.toLowerCase())
		if (signature) {
			const { keyId } = signature
			const pubKey = account.keys.find(k => k.index === keyId)
			if (!pubKey) {
				throw Error(`Key with index "${keyId}" not found on account with address ${addr}`)
			}
			return {
				signature: signature.signature,
				pubKey: pubKey.publicKey,
			}
		} else {
			throw Error(`Signature of user address "${addr}" not found`)
		}
	}
}

export class TezosWallet implements AbstractWallet {
	readonly blockchain = "TEZOS"

	constructor(
		public readonly provider: Provider,
		public readonly address: UnionAddress,
	) {
	}

	async signPersonalMessage(message: string): Promise<SignUserMessageResponse> {
		// return this.ethereum.personalSign(message)
		// @todo implement
		return { signature: message }
	}
}

export type BlockchainWallet = EthereumWallet | FlowWallet | TezosWallet
