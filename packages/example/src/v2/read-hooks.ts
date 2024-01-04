import type { IConnector, ProviderOption } from "@rarible/connector"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { UnionAddress } from "@rarible/types/build/union-address"
import type { Blockchain, CollectionId, Item, ItemId, ItemsSearchFilter, TraitEntry } from "@rarible/api-client"

type ExtendedProviderOption = ProviderOption<string, IWalletAndAddress> & {
	connect(): void
}

export type ConnectContextCommon = {
	connector: IConnector<string, IWalletAndAddress>
	options: ExtendedProviderOption[]
}

/**
 * Object of this type is available when wallet is connected
 */
export type ConnectContextConnected = ConnectContextCommon & {
	status: "connected"
	/**
	 * Connected wallet
	 */
	wallet: BlockchainWallet
	/**
	 * Connected wallet address
	 */
	address: UnionAddress
	/**
	 * Blockchain which wallet is connected to
	 */
	blockchain: Blockchain
	/**
	 * Call this function to disconnect from the account
	 */
	disconnect?: () => Promise<void>
	//todo add back option: string
}

export type ConnectContextDisconnected = ConnectContextCommon & {
	status: "disconnected"
	/**
	 * If connector was disconnected with error, then this field should contain the error
	 */
	error?: any
}

/**
 * When connector is initializing
 */
export type ConnectContextInitializing = ConnectContextCommon & {
	status: "initializing"
}

/**
 * When connector is connecting
 */
export type ConnectContextConnecting = ConnectContextCommon & {
	status: "connecting"
	option: string
}

export type ConnectContext =
	| ConnectContextDisconnected
	| ConnectContextInitializing
	| ConnectContextConnected
	| ConnectContextConnecting

/**
 * Returns state of the wallet connection with all needed information: wallet, blockchain, options etc
 */
export function useConnect(): ConnectContext {
	return null as any
}

type Data<T> = {
	status: "done"
	value: T
} | {
	status: "error"
	error?: any
} | {
	status: "loading"
}

type CollectionTraitsArgs = {
	collectionId: CollectionId[]
}

/**
 * Load all traits for collection(s).
 * This can be used to display list of traits to filter NFTs from specified collections
 */
export function useCollectionTraits(args: CollectionTraitsArgs): Data<TraitEntry[]> {
	return null as any
}

/**
 * Load NFTs by specific filter. This should be changed to support infinite list
 */
export function useNftList(args: ItemsSearchFilter): Data<Item[]> {
	return null as any
}

/**
 * Get data about specific NFT. Hook notifies if data of NFT was changed
 * @param itemId identifier of NFT to load data for
 */
export function useNft(itemId: ItemId): Data<Item> {
	return null as any
}