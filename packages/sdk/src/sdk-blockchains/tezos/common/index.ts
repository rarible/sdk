import type { ItemId, UnionAddress, Order, AssetType } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
// eslint-disable-next-line camelcase
import type {
	Provider,
	TezosProvider,
	AssetType as TezosAssetType,
	Asset as TezosLibAsset,
	TezosNetwork,
} from "tezos-sdk-module/dist/common/base"
// eslint-disable-next-line camelcase
import { get_public_key } from "tezos-sdk-module/dist/common/base"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "tezos-sdk-module"
import BigNumber from "bignumber.js"
import type { Part } from "tezos-sdk-module/dist/order/utils"
import type {
	Asset as TezosClientAsset } from "tezos-api-client/build"
import {
	Configuration,
	NftCollectionControllerApi,
	NftItemControllerApi,
	NftOwnershipControllerApi,
	OrderControllerApi,
} from "tezos-api-client/build"
import type { Maybe } from "@rarible/types/build/maybe"
import type { ContractAddress, OrderId } from "@rarible/types"
import type { BigNumber as RaribleBigNumber } from "@rarible/types/build/big-number"
import { toBigNumber as toRaribleBigNumber } from "@rarible/types/build/big-number"
import type { Part as TezosPart } from "tezos-sdk-module/dist/order/utils"
import type { OrderForm } from "tezos-sdk-module/dist/order"
import type { Payout } from "@rarible/api-client/build/models/Payout"
import type { Config } from "tezos-sdk-module"
import type { UnionPart } from "../../../types/order/common"
import type { CurrencyType } from "../../../common/domain"

export interface ITezosAPI {
	collection: NftCollectionControllerApi,
	item: NftItemControllerApi,
	ownership: NftOwnershipControllerApi,
	order: OrderControllerApi,
}

export type MaybeProvider<P extends TezosProvider> = {
	tezos: Maybe<P>
	api: string
	config: Config
}

export type PreparedOrder = OrderForm & { makeStock: RaribleBigNumber }

export type TezosMetadataResponse = {
	name: string
	description?: string
	artifactUri?: string
	displayUri?: string
	thumbnailUri?: string
	externalUri?: string
	formats?: Array<TezosMetaContent>
	attributes: Array<TezosMetaAttribute>
}

export type TezosMetaContent = {
	uri: string
	hash?: string
	mimeType?: string
	fileSize?: number
	fileName?: string
	duration?: string
	dimensions?: {
		value: string
		unit: string
	}
	dataRate?: {
		value: string
		unit: string
	}
}

export type TezosMetaAttribute = {
	name: string
	value?: string
	type?: string
}

export const XTZ_DECIMALS = 6

export function getTezosAPIs(network: TezosNetwork): ITezosAPI {
	const config = new Configuration({
		basePath: getTezosBasePath(network),
	})

	return {
		collection: new NftCollectionControllerApi(config),
		item: new NftItemControllerApi(config),
		ownership: new NftOwnershipControllerApi(config),
		order: new OrderControllerApi(config),
	}
}

export function getTezosBasePath(network: TezosNetwork): string {
	switch (network) {
		case "hangzhou": {
			return "https://rarible-api.functori.com"
		}
		case "mainnet": {
			return "https://tezos-api.rarible.org"
		}
		default: {
			throw new Error("Unsupported tezos network")
		}
	}
}

export function isExistedTezosProvider(provider: MaybeProvider<TezosProvider>): provider is Provider {
	return provider.tezos !== undefined
}

export function getMaybeTezosProvider(
	provider: Maybe<TezosProvider>, network: TezosNetwork
): MaybeProvider<TezosProvider> {
	switch (network) {
		case "hangzhou": {
			return {
				tezos: provider,
				api: `${getTezosBasePath(network)}/v0.1`,
				config: {
					exchange: "KT1ULGjK8FtaJ9QqCgJVN14B6tY76Ykaz6M8",
					transfer_proxy: "KT1Qypf9A7DHoAeesu5hj8v6iKwHsJb1RUR2",
					fees: new BigNumber(0),
					nft_public: "",
					mt_public: "",
				},
			}
		}
		case "mainnet": {
			return {
				tezos: provider,
				api: `${getTezosBasePath(network)}/v0.1`,
				config: {
					exchange: "KT198mqFKkiWerXLmMCw69YB1i6yzYtmGVrC",
					transfer_proxy: "KT1N2oby9tYmv5tjkGD1KyVzkDRCmgDkXgSD",
					fees: new BigNumber(0),
					nft_public: "",
					mt_public: "",
				},
			}
		}
		default: {
			throw new Error("Unsupported tezos network for config")
		}
	}
}

export function getRequiredProvider(provider: MaybeProvider<TezosProvider>): Provider {
	if (!isExistedTezosProvider(provider)) {
		throw new Error("Tezos provider is required")
	}
	return provider
}

export function getTezosOrderId(orderId: OrderId): string {
	if (!orderId) {
		throw new Error("OrderId has not been specified")
	}
	const [blockchain, id] = orderId.split(":")
	if (blockchain !== "TEZOS") {
		throw new Error("Not an TEZOS order")
	}
	return id
}

export function getTezosItemData(itemId: ItemId) {
	const [domain, contract, tokenId] = itemId.split(":")
	if (domain !== "TEZOS") {
		throw new Error(`Not an tezos item: ${itemId}`)
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

	return convertOrderPayout(payouts)
}

export function getSupportedCurrencies(): CurrencyType[] {
	return [{
		blockchain: Blockchain.TEZOS,
		type: "NATIVE",
	}]
}

export function convertOrderToFillOrder(order: Order): PreparedOrder {
	return {
		...convertOrderToOrderForm(order),
		makeStock: toRaribleBigNumber(order.makeStock),
	}
}

export function convertOrderToOrderForm(order: Order): OrderForm {
	if (order.data["@type"] !== "TEZOS_RARIBLE_V2") {
		throw new Error("Unsupported order data type")
	}
	return {
		type: "RARIBLE_V2",
		maker: order.maker,
		maker_edpk: order.data.makerEdpk!,
		taker: order.taker,
		taker_edpk: order.data.takerEdpk,
		make: {
			asset_type: getTezosAssetType(order.make.type),
			value: new BigNumber(order.make.value),
		},
		take: {
			asset_type: getTezosAssetType(order.take.type),
			value: new BigNumber(order.take.value),
		},
		salt: order.salt,
		start: order.startedAt ? parseInt(order.startedAt) : undefined,
		end: order.endedAt ? parseInt(order.endedAt) : undefined,
		signature: order.signature,
		data: {
			data_type: "V1",
			payouts: convertOrderPayout(order.data.payouts),
			origin_fees: convertOrderPayout(order.data.originFees),
		},
	}
}

export function getTezosAssetType(type: AssetType): TezosAssetType {
	switch (type["@type"]) {
		case "XTZ": {
			return {
				asset_class: "XTZ",
			}
		}
		case "TEZOS_FT": {
			return {
				asset_class: "FT",
				contract: convertContractAddress(type.contract),
				token_id: type.tokenId ?  new BigNumber(type.tokenId) : undefined,
			}
		}
		case "TEZOS_NFT": {
			return {
				asset_class: "NFT",
				contract: convertContractAddress(type.contract),
				token_id: new BigNumber(type.tokenId),
			}
		}
		case "TEZOS_MT": {
			return {
				asset_class: "MT",
				contract: convertContractAddress(type.contract),
				token_id: new BigNumber(type.tokenId),
			}
		}
		default: {
			throw new Error("Invalid take asset type")
		}
	}
}

export function covertToLibAsset(a: TezosClientAsset): TezosLibAsset {
	switch (a.assetType.assetClass) {
		case "XTZ": {
			return {
				asset_type: { asset_class: a.assetType.assetClass },
				value: new BigNumber(a.value),
			}
		}
		case "FT": {
			return {
				asset_type: {
					asset_class: a.assetType.assetClass,
					contract: a.assetType.contract,
					token_id: (a.assetType.tokenId === undefined) ? undefined : new BigNumber(a.assetType.tokenId),
				},
				value: new BigNumber(a.value),
			}
		}
		case "NFT":
		case "MT":
			return {
				asset_type: {
					asset_class: a.assetType.assetClass,
					contract: a.assetType.contract,
					token_id: new BigNumber(a.assetType.tokenId),
				},
				value: new BigNumber(a.value),
			}
		default: throw new Error("Unknown Asset Class")
	}
}

export function convertOrderPayout(payout?: Array<Payout>): Array<TezosPart> {
	return payout?.map(p => ({
		account: getTezosAddress(p.account),
		value: new BigNumber(p.value),
	})) || []
}

export function convertContractAddress(contract: ContractAddress): string {
	const [blockchain, tezosAddress] = contract.split(":")
	if (blockchain !== "TEZOS") {
		throw new Error(`Not a tezos contract address: ${contract}`)
	}
	return tezosAddress
}

export function convertUnionAddress(address: UnionAddress): string {
	const [blockchain, tezosAddress] = address.split(":")
	if (blockchain !== "TEZOS") {
		throw new Error(`Not a tezos address: ${address}`)
	}
	return tezosAddress
}
