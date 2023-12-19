import type { AssetType, Order, OrderId } from "@rarible/api-client"
import type { ContractAddress } from "@rarible/types"
import type { ItemId } from "@rarible/api-client"
import { toCollectionId } from "@rarible/types"
import type { CollectionId } from "@rarible/api-client"
import type { PrepareFillRequest } from "../../types/order/fill/domain"
import type { HasCollection, HasCollectionId } from "../../types/nft/mint/prepare-mint-request.type"

export function getOrderIdFromFillRequest(req?: PrepareFillRequest): OrderId | undefined {
	if (!req) return undefined
	if ("orderId" in req) {
		return req?.orderId
	} else if ("order" in req) {
		return req?.order?.id
	}
}

export function getNftContractAddress(assetType: AssetType): ContractAddress | undefined {
	switch (assetType["@type"]) {
		case "FLOW_NFT":
		case "TEZOS_NFT":
		case "ERC721":
		case "ERC721_Lazy":
		case "ERC1155":
		case "ERC1155_Lazy":
		case "CRYPTO_PUNKS":
		case "GEN_ART":
		case "COLLECTION":
		case "AMM_NFT": return assetType.contract
		default: return undefined
	}
}

export function getOrderNftContractAddress(order: Order): ContractAddress | undefined {
	return getNftContractAddress(order.make.type) || getNftContractAddress(order.take.type)
}

export function getItemIdData(itemId: ItemId) {
	if (!itemId) {
		throw new Error(`Not an item: ${itemId}`)
	}
	const [blockchain, contract, tokenId] = itemId.split(":")
	return {
		collection: toCollectionId(`${blockchain}:${contract}`),
		contract,
		tokenId,
		blockchain,
	}
}

export function getCollectionFromItemId(itemId: ItemId) {
	const { collection } = getItemIdData(itemId)
	return collection
}

export function getContractFromMintRequest(request: HasCollection | HasCollectionId): CollectionId {
	if ("collection" in request) return request.collection.id
	if ("collectionId" in request) return request.collectionId
	throw new Error("Wrong request: collection or collectionId has not been found")
}
