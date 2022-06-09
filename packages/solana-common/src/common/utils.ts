import * as web3 from "@solana/web3.js"

export function isPublicKey(x: any): x is web3.PublicKey {
	return x instanceof web3.PublicKey
}

export function isPrivateKey(x: any): x is web3.Keypair {
	return x instanceof web3.Keypair
}

export function toPublicKey(key: string): web3.PublicKey {
	return new web3.PublicKey(key)
}

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export function getUnixTs(): number {
	return new Date().getTime() / 1000
}
