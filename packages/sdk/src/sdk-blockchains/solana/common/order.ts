import BigNumber from "bignumber.js"
import type { SolanaAuctionHouseDataV1 } from "@rarible/api-client/build/models/OrderData"
import type { ItemId, Order, OrderId } from "@rarible/api-client"
import type { PublicKey } from "@solana/web3.js"
import { keccak256 } from "@ethersproject/keccak256"
import { toItemId, toOrderId } from "@rarible/types"
import type { PrepareFillRequest } from "../../../types/order/fill/domain"
import type { IApisSdk } from "../../../domain"
import { extractPublicKey } from "./address-converters"

export function getOrderId(orderType: "BUY" | "SELL", maker: string, itemId: string, auctionHouse: string): OrderId {
	const data = new TextEncoder().encode(maker + itemId + orderType + auctionHouse)
	return toOrderId("SOLANA:" + keccak256(data))
}

export async function getPreparedOrder(request: PrepareFillRequest, apis: IApisSdk): Promise<Order> {
	if ("order" in request) {
		return request.order
	}
	if ("orderId" in request) {
		return apis.order.getOrderById({ id: request.orderId })
	}
	throw new Error("Incorrect request")
}

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
	} else if (order.take.type["@type"] === "SOLANA_NFT") {
		return extractPublicKey(order.take.type.itemId)
	}
	throw new Error("Unsupported type")
}

export function getItemId(mint: PublicKey): ItemId {
	return toItemId("SOLANA:" + mint.toString())
}

export function getPrice(order: Order): BigNumber {
	if (order.take.type["@type"] === "SOLANA_SOL") {
		return new BigNumber(order.take.value)
	} else if (order.make.type["@type"] === "SOLANA_SOL") {
		return new BigNumber(order.make.value)
	}
	throw new Error("Unsupported currency type")
}

export function	getTokensAmount(order: Order): BigNumber {
	if (order.make.type["@type"] === "SOLANA_NFT") {
		return new BigNumber(order.make.value)
	} else if (order.take.type["@type"] === "SOLANA_NFT") {
		return new BigNumber(order.take.value)
	}
	throw new Error("Unsupported asset type")
}
