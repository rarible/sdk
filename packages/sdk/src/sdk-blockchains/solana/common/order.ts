import type { SolanaAuctionHouseDataV1 } from "@rarible/api-client/build/models/OrderData"
import type { Order } from "@rarible/api-client"
import type { PublicKey } from "@solana/web3.js"
import { extractPublicKey } from "./address-converters"

export function getOrderData(order: Order): SolanaAuctionHouseDataV1 {
	if (order.data?.["@type"] === "SOLANA_AUCTION_HOUSE_V1") {
		return order.data
	} else {
		throw new Error("Not an auction house order")
	}
}

export function getMintId(order: Order): PublicKey {
	if (order.make.type["@type"] === "SOLANA_NFT") {
		return extractPublicKey(order.make.type.itemId)
	}
	throw new Error("Unsupported type")
}

export function getPrice(order: Order): number {
	if (order.take.type["@type"] === "SOLANA_SOL") {
		return parseFloat(order.take.value.toString())
	}
	throw new Error("Unsupported currency type")
}
