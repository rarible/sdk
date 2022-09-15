import type {
	AssetType,
	CollectionId,
	ItemId,
	Order,
	TezosFTAssetType,
	TezosMTAssetType,
	TezosNFTAssetType,
	TezosXTZAssetType,
	UnionAddress,
} from "@rarible/api-client"
import { Blockchain, CollectionType } from "@rarible/api-client"
import type {
	Asset as TezosLibAsset,
	AssetType as TezosAssetType,
	Config,
	Provider,
	TezosNetwork,
	TezosProvider,
} from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { AssetTypeV2, get_public_key, pk_to_pkh } from "@rarible/tezos-sdk"
import type { Part } from "@rarible/tezos-common"
// eslint-disable-next-line camelcase
import { get_ft_type } from "@rarible/tezos-common"
import BigNumber from "bignumber.js"
import type { Asset as TezosClientAsset, AssetType as TezosClientAssetType } from "tezos-api-client/build"
import type {
	NftCollectionControllerApi,
	NftItemControllerApi,
	NftOwnershipControllerApi,
	OrderControllerApi,
} from "tezos-api-client/build"
import type { Maybe } from "@rarible/types/build/maybe"
import type { ContractAddress, OrderId } from "@rarible/types"
import { toCollectionId, toContractAddress, toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import type { BigNumber as RaribleBigNumber } from "@rarible/types/build/big-number"
import { toBigNumber as toRaribleBigNumber } from "@rarible/types/build/big-number"
// import type { Part as TezosPart } from "@rarible/tezos-sdk/dist/order/utils"
import type { OrderForm } from "@rarible/tezos-sdk/dist/order"
import type { Payout } from "@rarible/api-client/build/models/Payout"
import axios from "axios"
import type { UnionPart } from "../../../types/order/common"
import type { CurrencyType } from "../../../common/domain"
import type { RaribleSdkConfig } from "../../../config/domain"

export interface ITezosAPI {
	collection: NftCollectionControllerApi,
	item: NftItemControllerApi,
	ownership: NftOwnershipControllerApi,
	order: OrderControllerApi,
}

export type MaybeProvider<P extends TezosProvider> = {
	tezos: Maybe<P>
	config: Config
}

export type PreparedOrder = OrderForm & { makeStock: RaribleBigNumber }

export type TezosMetadataResponse = {
	name: string
	description?: string
	artifactUri?: string
	decimals: number
	displayUri?: string
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
		value: number
		unit: string
	}
}

export type TezosMetaAttribute = {
	name: string
	value?: string
	type?: string
}

export const XTZ_DECIMALS = 6

export function getTezosBasePath(network: TezosNetwork): string {
	switch (network) {
		case "testnet": {
			return "https://test-tezos-api.rarible.org"
		}
		case "dev": {
			return "http://dev-tezos-api.rarible.int"
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
	provider: Maybe<TezosProvider>, network: TezosNetwork, config: RaribleSdkConfig
): MaybeProvider<TezosProvider> {
	const unionApiBaseUrl = `${config.basePath}/v0.1`
	switch (network) {
		case "testnet": {
			return {
				tezos: provider,
				config: {
					exchange: "KT1S6H2FWxrpaD7aPRSW1cTTE1xPucXBSTL5",
					transfer_proxy: "KT1WbVjXdmBpzzVoYSSUiNt6QFnSC3W768d1",
					fees: new BigNumber(0),
					nft_public: "",
					mt_public: "",
					auction: "KT1CB5JBSC7kTxRV3ir2xsooMA1FLieiD4Mt",
					auction_storage: "KT1KWAPPjuDq4ZeX67rzZWsf6eAeqwtuAfSP",
					node_url: "https://rpc.tzkt.io/ithacanet",
					chain_id: "NetXnHfVqm9iesp",
					sales: "KT1NcKyhPnomH9PKGeDfvMiGH2PDgKCd5YuM",
					sales_storage: "KT1GDUG3AQpaKmFjFHVn6PYT4Tprf7ccwPa3",
					transfer_manager: "KT1LQPAi4w2h9GQ61S8NkENcNe3aH5vYEzjP",
					bid: "KT1MwKGYWWbXtfYdnQfwspwz5ZGfqGwiJuQF",
					bid_storage: "KT1ENB6j6uMJn7MtDV4VBE1AAAwCXmMtzjUd",
					sig_checker: "KT1Fbvkq4sMawS4rdNXswoN7ELgkNV1ooLB7",
					tzkt: "https://api.ghostnet.tzkt.io",
					dipdup: "https://testnet-tezos-indexer.rarible.org/v1/graphql",
					union_api: unionApiBaseUrl,
					objkt_sales_v1: "KT1Ax5fm2UNxjXGmrMDytREfqvYoCXoBB4Jo",
					objkt_sales_v2: "KT1GiZuR6TdkgxZGQGZSdbC3Jox9JTSbqTB6",
					royalties_provider: "KT1F68vtdE2HHhZa3jBNT1kCkMjaQAWCShXB",
					hen_marketplace: "KT1XYgjgFQutFfgEiD7RuppSKZsawZbkpKxL",
					hen_objkts: "KT1P2VyFd61A3ukizJoX37nFF9fqZnihv7Lw",
					teia_marketplace: "KT1Anx515N2PK8A2ZX5uGNn7Gckh4WytLJmK",
					versum_marketplace: "KT1B1Wz7jPH23EqKUpDwFDkw3A1yLxGZ4uJy",
					versum_nfts: "KT1UH5RSbomuV1o6UuDB9yeACbqRMup3utGu",
					fxhash_sales_v1: "KT1BEc3m6yxN856Y4zfArpDqQ1uZZ1HkDTRh",
					fxhash_sales_v2: "KT1GCLoBSwUaNjaGXq5RtiP8CXTL3cEeMNDs",
					fxhash_nfts_v1: "KT1VEXkw6rw6pJDP9APGsMneFafArijmM96j",
					fxhash_nfts_v2: "KT1WSwXCWPPAxAy4ibPmFyCm4NhmSJT9UuxQ",
				},
			}
		}
		case "dev": {
			return {
				tezos: provider,
				config: {
					exchange: "KT1S6H2FWxrpaD7aPRSW1cTTE1xPucXBSTL5",
					transfer_proxy: "KT1WbVjXdmBpzzVoYSSUiNt6QFnSC3W768d1",
					fees: new BigNumber(0),
					nft_public: "",
					mt_public: "",
					chain_id: "NetXnHfVqm9iesp",
					auction: "KT1CB5JBSC7kTxRV3ir2xsooMA1FLieiD4Mt",
					auction_storage: "KT1KWAPPjuDq4ZeX67rzZWsf6eAeqwtuAfSP",
					node_url: "https://rpc.tzkt.io/ghostnet",
					sales: "KT1NcKyhPnomH9PKGeDfvMiGH2PDgKCd5YuM",
					sales_storage: "KT1GDUG3AQpaKmFjFHVn6PYT4Tprf7ccwPa3",
					transfer_manager: "KT1LQPAi4w2h9GQ61S8NkENcNe3aH5vYEzjP",
					bid: "KT1MwKGYWWbXtfYdnQfwspwz5ZGfqGwiJuQF",
					bid_storage: "KT1ENB6j6uMJn7MtDV4VBE1AAAwCXmMtzjUd",
					sig_checker: "KT1Fbvkq4sMawS4rdNXswoN7ELgkNV1ooLB7",
					tzkt: "https://api.ghostnet.tzkt.io",
					dipdup: "https://dev-tezos-indexer.rarible.org/v1/graphql",
					union_api: "https://dev-api.rarible.org/v0.1",
					objkt_sales_v1: "KT1Ax5fm2UNxjXGmrMDytREfqvYoCXoBB4Jo",
					objkt_sales_v2: "KT1GiZuR6TdkgxZGQGZSdbC3Jox9JTSbqTB6",
					royalties_provider: "KT1F68vtdE2HHhZa3jBNT1kCkMjaQAWCShXB",
					hen_marketplace: "KT1XYgjgFQutFfgEiD7RuppSKZsawZbkpKxL",
					hen_objkts: "KT1P2VyFd61A3ukizJoX37nFF9fqZnihv7Lw",
					teia_marketplace: "KT1Anx515N2PK8A2ZX5uGNn7Gckh4WytLJmK",
					versum_marketplace: "KT1B1Wz7jPH23EqKUpDwFDkw3A1yLxGZ4uJy",
					versum_nfts: "KT1UH5RSbomuV1o6UuDB9yeACbqRMup3utGu",
					fxhash_sales_v1: "KT1BEc3m6yxN856Y4zfArpDqQ1uZZ1HkDTRh",
					fxhash_sales_v2: "KT1GCLoBSwUaNjaGXq5RtiP8CXTL3cEeMNDs",
					fxhash_nfts_v1: "KT1VEXkw6rw6pJDP9APGsMneFafArijmM96j",
					fxhash_nfts_v2: "KT1WSwXCWPPAxAy4ibPmFyCm4NhmSJT9UuxQ",
				},
			}
		}
		case "mainnet": {
			return {
				tezos: provider,
				config: {
					exchange: "KT198mqFKkiWerXLmMCw69YB1i6yzYtmGVrC",
					transfer_proxy: "KT1N2oby9tYmv5tjkGD1KyVzkDRCmgDkXgSD",
					fees: new BigNumber(0),
					nft_public: "",
					mt_public: "",
					auction: "",
					auction_storage: "",
					node_url: "https://rpc.tzkt.io/mainnet",
					chain_id: "NetXdQprcVkpaWU",
					sales: "KT1N4Rrm6BU6229drs6scrH3vard1pPngMyA",
					sales_storage: "KT1BEZNm3E25rZtXfPPKr5Jxygbi2kL2cCEW",
					transfer_manager: "KT1ViAbsAM5rp89yVydEkbQozp1S12zqirwS",
					bid: "",
					bid_storage: "",
					sig_checker: "KT1VAmfDTkcYKMZZQhwuxtCGoD1hx7v5bjZ9",
					tzkt: "https://api.mainnet.tzkt.io",
					dipdup: "https://tezos-indexer.rarible.org/v1/graphql",
					union_api: unionApiBaseUrl,
					objkt_sales_v2: "KT1WvzYHCNBvDSdwafTHv7nJ1dWmZ8GCYuuC",
					objkt_sales_v1: "KT1FvqJwEDWb1Gwc55Jd1jjTHRVWbYKUUpyq",
					royalties_provider: "KT1HNNrmCk1fpqveRDz8Fvww2GM4gPzmA7fo",
					hen_marketplace: "KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn",
					hen_objkts: "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton",
					teia_marketplace: "KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w",
					versum_marketplace: "KT1GyRAJNdizF1nojQz62uGYkx8WFRUJm9X5",
					versum_nfts: "KT1LjmAdYQCLBjwv4S2oFkEzyHVkomAf5MrW",
					fxhash_sales_v1: "KT1Xo5B7PNBAeynZPmca4bRh6LQow4og1Zb9",
					fxhash_sales_v2: "KT1GbyoDi7H1sfXmimXpptZJuCdHMh66WS9u",
					fxhash_nfts_v1: "KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE",
					fxhash_nfts_v2: "KT1U6EHmNxJTkvaWJ4ThczG4FSDaHC21ssvi",
				},
			}
		}
		default: {
			throw new Error("Unsupported tezos network for config")
		}
	}
}

const checkChainIdCache: Map<TezosProvider, string> = new Map()
export async function checkChainId(provider: MaybeProvider<TezosProvider>) {
	let walletChainId = checkChainIdCache.get(provider.tezos!)
	if (!walletChainId) {
		walletChainId = await provider.tezos?.chain_id()
		checkChainIdCache.set(provider.tezos!, walletChainId!)
	}

	if (walletChainId !== provider.config.chain_id) {
		throw new Error(`Config chainId=${provider.config.chain_id}, but wallet chainId=${walletChainId}`)
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
	if (blockchain !== Blockchain.TEZOS) {
		throw new Error("Not an TEZOS order")
	}
	return id
}

export function getTezosItemData(itemId: ItemId) {
	const [domain, contract, tokenId] = itemId.split(":")
	if (domain !== Blockchain.TEZOS) {
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
	if (blockchain !== Blockchain.TEZOS) {
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

	return convertUnionParts(payouts)
}

export function getSupportedCurrencies(): CurrencyType[] {
	return [
		{ blockchain: Blockchain.TEZOS, type: "NATIVE" },
		{ blockchain: Blockchain.TEZOS, type: "TEZOS_FT" },
	]
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
			payouts: convertUnionParts(order.data.payouts),
			origin_fees: convertUnionParts(order.data.originFees),
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
				contract: convertFromContractAddress(type.contract),
				token_id: type.tokenId ?  new BigNumber(type.tokenId) : undefined,
			}
		}
		case "TEZOS_NFT": {
			return {
				asset_class: "NFT",
				contract: convertFromContractAddress(type.contract),
				token_id: new BigNumber(type.tokenId),
			}
		}
		case "TEZOS_MT": {
			return {
				asset_class: "MT",
				contract: convertFromContractAddress(type.contract),
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

export function convertTezosToUnionAsset(assetType: TezosClientAssetType): AssetType {
	switch (assetType.assetClass) {
		case "XTZ": {
			return { "@type": "XTZ" }
		}
		case "FT": {
			return {
				"@type": "TEZOS_FT",
				contract: convertTezosToContractAddress(assetType.contract),
				tokenId: assetType.tokenId ? toRaribleBigNumber(assetType.tokenId) : undefined,
			}
		}
		case "NFT": {
			return {
				"@type": "TEZOS_NFT",
				contract: convertTezosToContractAddress(assetType.contract),
				tokenId: toRaribleBigNumber(assetType.tokenId),
			}
		}
		case "MT": {
			return {
				"@type": "TEZOS_MT",
				contract: convertTezosToContractAddress(assetType.contract),
				tokenId: toRaribleBigNumber(assetType.tokenId),
			}
		}
		default: {
			throw new Error("Invalid asset type")
		}
	}
}

export function getCollectionTypeAssetClass(type: CollectionType.TEZOS_NFT | CollectionType.TEZOS_MT): "MT" | "NFT" {
	switch (type) {
		case CollectionType.TEZOS_MT: return "MT"
		case CollectionType.TEZOS_NFT: return "NFT"
		default: throw new Error("Unrecognized NFT collection type")
	}
}

export function convertUnionParts(parts?: Array<Payout>): Array<Part> {
	return parts?.map(p => ({
		account: getTezosAddress(p.account),
		value: new BigNumber(p.value),
	})) || []
}

export function convertFromContractAddress(contract: ContractAddress): string {
	const [blockchain, tezosAddress] = contract.split(":")
	if (blockchain !== Blockchain.TEZOS) {
		throw new Error(`Not a tezos contract address: ${contract}`)
	}
	return tezosAddress
}

export function convertUnionAddress(address: UnionAddress): string {
	const [blockchain, tezosAddress] = address.split(":")
	if (blockchain !== Blockchain.TEZOS) {
		throw new Error(`Not a tezos address: ${address}`)
	}
	return tezosAddress
}

export function convertTezosOrderId(hash: string): OrderId {
	return toOrderId(`${Blockchain.TEZOS}:${hash}`)
}

export function convertTezosItemId(itemId: string): ItemId {
	return toItemId(`${Blockchain.TEZOS}:${itemId}`)
}

export function convertTezosToContractAddress(address: string): ContractAddress {
	return toContractAddress(`${Blockchain.TEZOS}:${address}`)
}

export function convertTezosToCollectionAddress(address: string): CollectionId {
	return toCollectionId(`${Blockchain.TEZOS}:${address}`)
}

export function convertTezosToUnionAddress(address: string): UnionAddress {
	return toUnionAddress(`${Blockchain.TEZOS}:${address}`)
}

export type CurrencyV2 = {
	type: AssetTypeV2
	// eslint-disable-next-line camelcase
	asset_contract: string | undefined
	// eslint-disable-next-line camelcase
	asset_token_id: BigNumber | undefined
}

export async function getTezosAssetTypeV2(config: Config, type: AssetType): Promise<CurrencyV2> {
	switch (type["@type"]) {
		case "XTZ": {
			return {
				type: AssetTypeV2.XTZ,
				asset_contract: undefined,
				asset_token_id: undefined,
			}
		}
		case "TEZOS_FT": {
			const contract = convertFromContractAddress(type.contract)
			let ftType: AssetTypeV2 | undefined = AssetTypeV2.FA2
			try {
				ftType = await get_ft_type(config, contract)
			} catch (e) {
				console.log("error get_ft_type", e, contract)
			}
			if (ftType === AssetTypeV2.FA2) {
				return {
					type: AssetTypeV2.FA2,
					asset_contract: contract,
					asset_token_id: new BigNumber(type.tokenId || 0),
				}

			} else if (ftType === AssetTypeV2.FA12) {

				return {
					type: AssetTypeV2.FA12,
					asset_contract: contract,
					asset_token_id: undefined,
				}

			} else {
				throw new Error("Unrecognized FT contract type, check contract and network")
			}
		}
		default: {
			throw new Error("Invalid asset type")
		}
	}
}

export function getTokenIdString(tokenId: BigNumber | string | undefined): string | undefined {
	return tokenId !== undefined ? tokenId.toString(): undefined
}

export function isNftAssetType(assetType: AssetType): assetType is TezosNFTAssetType {
	return assetType["@type"] === "TEZOS_NFT"
}
export function isMTAssetType(assetType: AssetType): assetType is TezosMTAssetType {
	return assetType["@type"] === "TEZOS_MT"
}
export function isXtzAssetType(assetType: AssetType): assetType is TezosXTZAssetType {
	return assetType["@type"] === "XTZ"
}
export function isFTAssetType(assetType: AssetType): assetType is TezosFTAssetType {
	return assetType["@type"] === "TEZOS_FT"
}

export async function getCollectionType(
	provider: MaybeProvider<TezosProvider>, collection: string
): Promise<CollectionType.TEZOS_NFT | CollectionType.TEZOS_MT> {
	let response
	try {
		const { data } = await axios.get(`${provider.config.tzkt}/v1/contracts/${collection}/storage/schema`)
		response = data
	} catch (e) {
		console.error(e)
		throw new Error("Getting tezos collection data error")
	}

	const schema = response["schema:object"]
	if ("ledger:big_map:object:nat" in schema) {
		return CollectionType.TEZOS_MT
	} else if ("ledger:big_map_flat:nat:address" in schema) {
		return CollectionType.TEZOS_NFT
	} else {
		throw new Error("Unrecognized tezos collection")
	}
}
