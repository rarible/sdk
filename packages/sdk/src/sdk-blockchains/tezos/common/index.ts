import { ItemId } from "@rarible/api-client"
// eslint-disable-next-line camelcase
import { get_public_key, Provider } from "tezos-sdk-module/dist/common/base"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "tezos-sdk-module"
import BigNumber from "bignumber.js"
import { Part } from "tezos-sdk-module/dist/order/utils"
import { Configuration, NftCollectionControllerApi, NftItemControllerApi } from "tezos-api-client/build"
import { UnionPart } from "../../../order/common"
import { CurrencyType } from "../../../common/domain"

export interface ITezosAPI {
	collection: NftCollectionControllerApi,
	item: NftItemControllerApi,
}

export function getTezosAPIs(): ITezosAPI {
	const config = new Configuration({
		basePath: "https://rarible-api.functori.com",
	})

	return {
		collection: new NftCollectionControllerApi(config),
		item: new NftItemControllerApi(config),
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
