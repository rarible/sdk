import { Config as TezosConfig } from "tezos-sdk-module/dist/config/type"
import { TezosProvider } from "tezos-sdk-module/dist/common/base"

export type ItemType = {
	id: string,
	contract: string,
	tokenId: string,
	creators: Array<{ account: string, value: string }>,
	supply: string,
	lazySupply: string,
	owners: Array<string>,
	royalties: Array<{ account: string, value: string }>,
	date: string,
	deleted: boolean,
}

export type TezosOrder = {
	hash: string
}

export type TezosProviderResponse = {
	config: TezosConfig,
	tezos: TezosProvider,
}

export type GetNftOwnershipByIdResponse = {
	id: string,
	contract: string,
	tokenId: string,
	owner: string,
	creators: Array<{ account: string, value: string }>,
	lazySupply: string,
	date: string,
	value: string,
	lazyValue: string,
}

export type Collection = {
	id: string,
	owner: string,
	type: string,
	name: string,
	features: [],
	// eslint-disable-next-line camelcase
	supports_lazy_mint: boolean,
	minters: string[]
}
