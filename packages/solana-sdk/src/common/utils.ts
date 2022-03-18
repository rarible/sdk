import { PublicKey } from "@solana/web3.js"
import * as web3 from "@solana/web3.js"
import type { BN } from "@project-serum/anchor"

export function isPublicKey(x: any): x is PublicKey {
	return x instanceof PublicKey
}

export function isPrivateKey(x: any): x is web3.Keypair {
	return x instanceof web3.Keypair
}

export function toPublicKey(key: string): PublicKey {
	// todo: add cache ?
	return new PublicKey(key)
}

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export function getUnixTs() {
	return new Date().getTime() / 1000
}

export function bnToBuffer(value: BN, endian: BN.Endianness, length: number) {
	return value.toArrayLike(Buffer, endian, length)
}
