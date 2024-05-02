import nacl from "tweetnacl"
import base58 from "bs58"
import type { SolanaSignature, SolanaSigner, TransactionOrVersionedTransaction } from "@rarible/solana-common"
import type { PublicKey, Transaction } from "@solana/web3.js"
import { Keypair } from "@solana/web3.js"

export class SolanaKeypairWallet implements SolanaSigner {
	static fromKeypair(keyPair: Keypair) {
		return new SolanaKeypairWallet(keyPair)
	}

	static fromKey(secret: Uint8Array | string) {
		return new SolanaKeypairWallet(Keypair.fromSecretKey(toUint8SecretKey(secret)))
	}

	static fromSeed(seed: Uint8Array | undefined): SolanaKeypairWallet {
		const pair = seed ? Keypair.fromSeed(seed) : Keypair.generate()
		return SolanaKeypairWallet.fromKeypair(pair)
	}

	readonly publicKey: PublicKey
	private constructor(public readonly keyPair: Keypair) {
		this.publicKey = keyPair.publicKey
	}

	signTransaction = (tx: TransactionOrVersionedTransaction) => isTransaction(tx)
		? Promise.resolve(signWithKeypair(tx, this.keyPair))
		: Promise.reject(new UnsupportedSolanaTransactionType())

	signAllTransactions = (txs: TransactionOrVersionedTransaction[]) =>
		Promise.all(txs.map(x => this.signTransaction(x)))

	signMessage = async (message: Uint8Array | string): Promise<SolanaSignature> => ({
		publicKey: this.publicKey,
		signature: nacl
			.sign(getSignMessageData(message), this.keyPair.secretKey)
			.slice(0, nacl.sign.signatureLength),
	})
}

function isTransaction(tx: TransactionOrVersionedTransaction): tx is Transaction {
	return "partialSign" in tx
}

function signWithKeypair(tx: Transaction, keypair: Keypair) {
	tx.partialSign(keypair)
	return tx
}

function toUint8SecretKey(str: Uint8Array | string): Uint8Array {
	if (typeof str === "string") return Uint8Array.from(base58.decode(str))
	return str
}

function getSignMessageData(message: Uint8Array | string) {
	if (typeof message === "string") return new TextEncoder().encode(message)
	return message
}

class UnsupportedSolanaTransactionType extends Error {
	constructor() {
		super("VersionedTransaction is not supported")
		this.name = "UnsupportedSolanaTransactionType"
	}
}