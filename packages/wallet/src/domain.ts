export type UserSignature = {
	signature: string
	publicKey: string
}

export interface AbstractWallet {
	signPersonalMessage(message: string): Promise<UserSignature>
}
