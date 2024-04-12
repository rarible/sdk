
export type AptosNftSdk = {
	createCollection(): Promise<{}>
}

export type RaribleAptosSdk = {
	nft: AptosNftSdk
}
