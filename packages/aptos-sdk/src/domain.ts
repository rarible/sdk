import type {
	CommittedTransactionResponse,
	Network,
	AptosSettings,
} from "@aptos-labs/ts-sdk"
import type {
	CreateCollectionOptions,
	MintByCollectionNameOptions,
	MintByCollectionAddressOptions,
} from "./nft/nft"

export interface AptosNftSdk {
	createCollection(options: CreateCollectionOptions): Promise<{
		tx: CommittedTransactionResponse,
		collectionAddress: string
	}>
	mintWithCollectionName(options: MintByCollectionNameOptions): Promise<{
		tx: CommittedTransactionResponse,
		tokenAddress: string
	}>
	mintWithCollectionAddress(options: MintByCollectionAddressOptions): Promise<{
		tx: CommittedTransactionResponse,
		tokenAddress: string
	}>
	transfer(tokenAddress: string, to: string): Promise<CommittedTransactionResponse>
	burn(tokenAddress: string): Promise<CommittedTransactionResponse>
}

export type AptosSdkEnv = Network.TESTNET | Network.MAINNET

export type AptosSdkConfig = Omit<AptosSettings, "network">
