import type { Blockchain, UnionAddress } from "@rarible/api-client"

export type UserSignature = {
	signature: string
	publicKey: string
}

export interface AbstractWallet {
	blockchain: Blockchain
	signPersonalMessage(message: string): Promise<UserSignature>
	getAddress(): Promise<UnionAddress>
}
