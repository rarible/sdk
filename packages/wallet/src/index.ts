import type { Ethereum } from "@rarible/ethereum-provider"
import type { Fcl } from "@rarible/fcl-types"
import { Blockchain } from "@rarible/api-client"
import type { TezosProvider } from "tezos-sdk-module"
import type { AbstractWallet, UserSignature } from "./domain"

export class EthereumWallet<T extends Ethereum = Ethereum> implements AbstractWallet {
	readonly blockchain = Blockchain.ETHEREUM

	constructor(public readonly ethereum: T) {}

	async signPersonalMessage(message: string): Promise<UserSignature> {
		const address = await this.ethereum.getFrom()
		if (!address) {
			throw new Error("Not connected to Ethereum blockchain")
		}
		return {
			signature: await this.ethereum.personalSign(message),
			publicKey: address,
		}
	}
}

export class FlowWallet implements AbstractWallet {
	readonly blockchain = Blockchain.FLOW

	constructor(public readonly fcl: Fcl) {}

	async signPersonalMessage(message: string): Promise<UserSignature> {
		if (!message.length) {
			throw new Error("Message can't be empty")
		}
		const messageHex = Buffer.from(message).toString("hex")
		const currentUser = this.fcl.currentUser()
		const user = await this.fcl.currentUser().snapshot()
		const address = user.addr
		if (!address) {
			throw new Error("Not connected to Flow blockchain")
		}
		const account = await this.fcl.account(address)

		const signatures = await currentUser.signUserMessage(messageHex)
		if (typeof signatures === "string") {
			throw new Error(signatures)
		}

		const signature = signatures.find(s => {
			return s.addr.toLowerCase() === address.toLowerCase()
		})
		if (signature) {
			const pubKey = account.keys.find(k => k.index === signature.keyId)
			if (!pubKey) {
				throw new Error(`Key with index "${signature.keyId}" not found on account with address ${address}`)
			}
			return {
				signature: signature.signature,
				publicKey: pubKey.publicKey,
			}
		}
		throw new Error(`Signature of user address "${address}" not found`)
	}
}

export class TezosWallet implements AbstractWallet {
	readonly blockchain = Blockchain.TEZOS

	constructor(public readonly provider: TezosProvider) {}

	async signPersonalMessage(message: string): Promise<UserSignature> {
		const publicKey = await this.provider.public_key()
		if (publicKey === undefined) {
			throw new Error("Public key undefined")
		}
		return {
			signature: await this.provider.sign(message),
			publicKey,
		}
	}
}

export type BlockchainWallet = EthereumWallet<Ethereum> | FlowWallet | TezosWallet

export type WalletByBlockchain = {
	"FLOW": FlowWallet
	"ETHEREUM": EthereumWallet
	"TEZOS": TezosWallet
}
