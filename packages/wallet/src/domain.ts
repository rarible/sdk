export type UserSignature = {
	signature: string
	publicKey: string
}

export interface AbstractWallet {
	signPersonalMessage(message: string): Promise<UserSignature>
}

export enum WalletType {
	ETHEREUM = "ETHEREUM",
	SOLANA = "SOLANA",
	TEZOS = "TEZOS",
	FLOW = "FLOW",
	IMMUTABLEX = "IMMUTABLEX",
}
