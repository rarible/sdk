import * as web3 from "@solana/web3.js"
import * as nacl from "tweetnacl"
import base58 from "bs58"
import { isPrivateKey } from "@rarible/solana-common"
import type { IWalletSigner } from "../domain"
import type { DisplayEncoding } from "../domain"

/**
 * Abstraction over solana web3.Keypair
 */
export class SolanaKeypairWallet implements IWalletSigner {
	private _keyPair: web3.Keypair

	private constructor(keyPair: web3.Keypair) {
		this._keyPair = keyPair
	}

	public get keyPair(): web3.Keypair {
		return this._keyPair
	}

	public get publicKey(): web3.PublicKey {
		return this.keyPair.publicKey
	}

	async signTransaction(tx: web3.Transaction): Promise<web3.Transaction> {
		tx.partialSign(this.keyPair)
		return tx
	}

	async signAllTransactions(txs: web3.Transaction[]): Promise<web3.Transaction[]> {
		return txs.map((t) => {
			t.partialSign(this.keyPair)
			return t
		})
	}

	//eslint-disable-next-line @typescript-eslint/no-unused-vars
	async signMessage(message: Uint8Array | string, display?: DisplayEncoding) {
		let data: Uint8Array
		if (typeof message === "string") {
			data = new TextEncoder().encode(message)
		} else {
			data = message
		}
		return nacl.sign(data, this._keyPair.secretKey).slice(0, nacl.sign.signatureLength)
	}

	/**
	 * Instantiate new SolanaWallet with provided keypair or from secret key
	 * @param keyPair
	 */
	static createFrom(keyPair: web3.Keypair | Uint8Array | string): SolanaKeypairWallet {
		if (isPrivateKey(keyPair)) {
			return new SolanaKeypairWallet(keyPair)
		} else if (ArrayBuffer.isView(keyPair)) {
			return new SolanaKeypairWallet(web3.Keypair.fromSecretKey(keyPair))
		} else if (typeof keyPair === "string") {
			return new SolanaKeypairWallet(web3.Keypair.fromSecretKey(
				Uint8Array.from(base58.decode(keyPair))
			))
		}

		throw new Error("Unknown type of secret key")
	}

	/**
	 * Instantiate new SolanaWallet with new generated keypair
	 */
	static generate(seed?: Uint8Array): SolanaKeypairWallet {
		return SolanaKeypairWallet.createFrom(
			seed ? web3.Keypair.fromSeed(seed) : web3.Keypair.generate()
		)
	}
}