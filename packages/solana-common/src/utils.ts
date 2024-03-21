import { PublicKey } from "@solana/web3.js"

export function toPublicKey(key: string): PublicKey {
	return new PublicKey(key)
}

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export function getUnixTs(): number {
	return new Date().getTime() / 1000
}
