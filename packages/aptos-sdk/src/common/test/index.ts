import {
	Account,
	Aptos,
	AptosConfig, Ed25519PrivateKey,
	Network,
} from "@aptos-labs/ts-sdk"
import { AptosGenericSdkWallet } from "@rarible/aptos-wallet"
import { AptosNft } from "../../nft/nft"

export function createTestAptosState(privateKey: string = DEFAULT_PK) {
	const pk = new Ed25519PrivateKey(privateKey)
	const account = Account.fromPrivateKey({ privateKey: pk })

	const APTOS_NETWORK: Network = Network.TESTNET
	const config = new AptosConfig({ network: APTOS_NETWORK })

	// console.log("create aptos nfy collection", owner.accountAddress.toString())
	// Also, can use this function that resolves the provided private key type and derives the public key from it
	// to support key rotation and differentiation between Legacy Ed25519 and Unified authentications
	// Read more https://github.com/aptos-labs/aptos-ts-sdk/blob/main/src/api/account.ts#L364
	const aptos = new Aptos(config)

	return {
		aptos,
		account,
	}
}

export const DEFAULT_PK = "0x229eea52e53be5a6fd1ba00e660fc632cdb47ffe8f777a847daa8220553c5511"

export async function mintTestToken(
	aptos: Aptos,
	account: Account
) {
	const mintClass = new AptosNft(aptos, new AptosGenericSdkWallet(aptos, account))
	const randomId = Math.floor(Math.random() * 1000000)
	const uri = "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/"
	const { collectionAddress } = await mintClass.createCollection({
		name: `Rarible Test collection ${randomId}-${randomId * 5}-${randomId}`,
		description: "",
		uri,
	})
	const { tokenAddress } = await mintClass.mintWithCollectionAddress({
		collectionAddress,
		name: `Mytoken #${randomId}`,
		description: `Description of Mytoken #${randomId}`,
		uri,
	})
	return tokenAddress
}
