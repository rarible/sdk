import type { Ethereum } from "@rarible/ethereum-provider"
import type { UnionAddress } from "@rarible/api-client"
import type { Provider } from "tezos-sdk-module/dist/common/base"
import type { Fcl } from "@rarible/fcl-types"
import type { AbstractWallet, UserSignature } from "./domain"

export class EthereumWallet<T extends Ethereum = Ethereum> implements AbstractWallet {
	readonly blockchain = "ETHEREUM"

	constructor(public readonly ethereum: T, public readonly address: UnionAddress) {}

	async signPersonalMessage(message: string): Promise<UserSignature> {
		return {
			signature: await this.ethereum.personalSign(message),
			publicKey: this.address,
		}
	}
}

export class FlowWallet implements AbstractWallet {
	readonly blockchain = "FLOW"

	constructor(public readonly fcl: Fcl, public readonly address: UnionAddress) {}

	async signPersonalMessage(message: string): Promise<UserSignature> {
		if (!message.length) {
			throw new Error("Message can't be empty")
		}
		const messageHex = Buffer.from(message).toString("hex")
		const currentUser = this.fcl.currentUser()
		const account = await this.fcl.account(this.address)

		const signatures = await currentUser.signUserMessage(messageHex)
		if (typeof signatures === "string") {
			throw new Error(signatures)
		}

		const signature = signatures.find(s => {
			return s.addr.toLowerCase() === this.address.toLowerCase()
		})
		if (signature) {
			const pubKey = account.keys.find(k => k.index === signature.keyId)
			if (!pubKey) {
				throw new Error(`Key with index "${signature.keyId}" not found on account with address ${this.address}`)
			}
			return {
				signature: signature.signature,
				publicKey: pubKey.publicKey,
			}
		}
		throw new Error(`Signature of user address "${this.address}" not found`)
	}
}

export class TezosWallet implements AbstractWallet {
	readonly blockchain = "TEZOS"

	constructor(public readonly provider: Provider, public readonly address: UnionAddress) {}

	async signPersonalMessage(message: string): Promise<UserSignature> {
		// @todo implement
		return {
			signature: message,
			publicKey: this.address,
		}
	}
}

export type BlockchainWallet = EthereumWallet<Ethereum> | FlowWallet | TezosWallet
