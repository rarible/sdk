import type { Ethereum } from "@rarible/ethereum-provider"
import type { Fcl } from "@rarible/fcl-types"
import type { TezosProvider } from "@rarible/tezos-sdk"
import type { SolanaWalletProvider } from "@rarible/solana-wallet"
import type { AuthWithPrivateKey } from "@rarible/flow-sdk/build/types"
import type { ImxWallet } from "@rarible/immutable-wallet"
import type { AbstractWallet, UserSignature } from "./domain"
import { WalletType } from "./domain"

export class EthereumWallet<T extends Ethereum = Ethereum> implements AbstractWallet {
	readonly walletType = WalletType.ETHEREUM

	constructor(public readonly ethereum: T) {
	}

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
	readonly walletType = WalletType.FLOW

	constructor(public readonly fcl: Fcl, public auth?: AuthWithPrivateKey) {
	}

	getAuth(): AuthWithPrivateKey {
		return this.auth
	}

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

export interface TezosSignatureResult {
	signature: string;
	edpk: string;
	prefix: string;
}

export class TezosWallet implements AbstractWallet {
	readonly walletType = WalletType.TEZOS

	constructor(public readonly provider: TezosProvider) {
	}

	private async sign(p: TezosProvider, message: string, type: "operation" | "message"): Promise<TezosSignatureResult> {
		type = type || "message"
		const edpk = await p.public_key()
		if (edpk === undefined) throw new Error("cannot get public key from provider")
		const r = await p.sign(message, type)
		return { edpk, ...r }
	}

	async signPersonalMessage(message: string): Promise<UserSignature> {
		const publicKey = await this.provider.public_key()
		if (publicKey === undefined) {
			throw new Error("Public key undefined")
		}

		const result = await this.sign(this.provider, message, "message")
		return {
			signature: result.signature,
			publicKey: `${result.edpk}_${result.prefix}`,
		}
	}
}

export class SolanaWallet implements AbstractWallet {
	readonly walletType = WalletType.SOLANA

	constructor(public readonly provider: SolanaWalletProvider) {
	}

	async signPersonalMessage(message: string): Promise<UserSignature> {
		const data = new TextEncoder().encode(message)
		const res = await this.provider.signMessage(data, "utf8")

		if (res.signature) { // phantom wallet response
			return {
				signature: Buffer.from(res.signature).toString("hex"),
				publicKey: res.publicKey.toString(),
			}
		} else { // solflare wallet response
			return {
				signature: Buffer.from(res).toString("hex"),
				publicKey: this.provider.publicKey.toString(),
			}
		}
	}
}

export class ImmutableXWallet implements AbstractWallet {
	readonly walletType = WalletType.IMMUTABLEX

	constructor(public wallet: ImxWallet) {
	}

	async signPersonalMessage(message: string): Promise<UserSignature> {
		return {
			signature: (await this.wallet.link.sign({ message, description: message })).result,
			publicKey: this.wallet.getConnectionData().address,
		}
	}
}

export type BlockchainWallet =
	EthereumWallet |
	FlowWallet |
	TezosWallet |
	SolanaWallet |
	ImmutableXWallet

export function isBlockchainWallet(x: any): x is BlockchainWallet {
	return x instanceof EthereumWallet ||
		x instanceof TezosWallet ||
		x instanceof FlowWallet ||
		x instanceof SolanaWallet ||
		x instanceof ImmutableXWallet ||
		(
			(
				(x.walletType === WalletType.ETHEREUM && x.ethereum) ||
				(x.walletType === WalletType.SOLANA && x.provider) ||
				(x.walletType === WalletType.FLOW && x.fcl) ||
				(x.walletType === WalletType.TEZOS && x.provider) ||
				(x.walletType === WalletType.IMMUTABLEX && x.wallet)
			) && (x.signPersonalMessage)
		)
}

export type WalletByBlockchain = {
	"FLOW": FlowWallet
	"ETHEREUM": EthereumWallet
	"TEZOS": TezosWallet
	"SOLANA": SolanaWallet
	"IMMUTABLEX": ImmutableXWallet
}

export { WalletType }
export { getRaribleWallet, BlockchainProvider, RaribleSdkProvider } from "./get-wallet"
