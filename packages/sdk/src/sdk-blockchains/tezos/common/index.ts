import type { ItemId, UnionAddress } from "@rarible/api-client"
// eslint-disable-next-line camelcase
import type { Provider } from "tezos-sdk-module/dist/common/base"
// eslint-disable-next-line camelcase
import { get_public_key } from "tezos-sdk-module/dist/common/base"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "tezos-sdk-module"
import BigNumber from "bignumber.js"
import type { Part } from "tezos-sdk-module/dist/order/utils"
import { Configuration, NftCollectionControllerApi, NftItemControllerApi } from "tezos-api-client/build"
import type { UnionPart } from "../../../types/order/common"
import type { CurrencyType } from "../../../common/domain"
import type { TezosNetwork } from "../domain"

export interface ITezosAPI {
	collection: NftCollectionControllerApi,
	item: NftItemControllerApi,
}

export function getTezosAPIs(network: TezosNetwork): ITezosAPI {
	const config = new Configuration({
		basePath: getTezosBasePath(network),
	})

	return {
		collection: new NftCollectionControllerApi(config),
		item: new NftItemControllerApi(config),
	}
}

export function getTezosBasePath(network: TezosNetwork): string {
	switch (network) {
		case "granada": {
			return "https://rarible-api.functori.com"
		}
		default: {
			throw new Error("Unsupported tezos network ")
		}
	}
}

export function getTezosItemData(itemId: ItemId) {
	const [domain, contract, tokenId] = itemId.split(":")
	if (domain !== "TEZOS") {
		throw new Error(`Not an ethereum item: ${itemId}`)
	}
	return {
		itemId: `${contract}:${tokenId}`,
		contract,
		tokenId,
		domain,
	}
}

export function getTezosAddress(address: UnionAddress): string {
	const [blockchain, tezosAddress] = address.split(":")
	if (blockchain !== "TEZOS") {
		throw new Error(`Not an tezos item: ${address}`)
	}
	return tezosAddress
}

export async function getMakerPublicKey(provider: Provider): Promise<string> {
	const maker = await get_public_key(provider)
	if (!maker) {
		throw new Error("Maker does not exist")
	}
	return maker
}

export async function getPayouts(provider: Provider, requestPayouts?: UnionPart[]): Promise<Part[]> {
	let payouts = requestPayouts || []

	if (!Array.isArray(payouts) || payouts.length === 0) {
		return [{
			account: pk_to_pkh(await getMakerPublicKey(provider)),
			value: new BigNumber(10000),
		}]
	}

	return payouts.map(p => ({
		account: pk_to_pkh(p.account),
		value: new BigNumber(p.value),
	})) || []
}

export function getSupportedCurrencies(): CurrencyType[] {
	return [{
		blockchain: "TEZOS",
		type: "NATIVE",
	}]
}
