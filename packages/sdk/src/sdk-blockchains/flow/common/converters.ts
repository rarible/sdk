import { Blockchain, ItemId } from "@rarible/api-client"
import { toItemId, UnionAddress } from "@rarible/types"

const FLOW_COLLECTION_REGEXP = /^FLOW\:A\.0*x*[0-9a-f]{16}\.[A-Za-z]{3,}/

export function getFlowCollection(collection: string): string {
	if (FLOW_COLLECTION_REGEXP.test(collection)) {
		return collection.split(":")[1]
	}
	throw Error("Invalid collection")
}

const FLOW_ITEM_ID_REGEXP = /^FLOW\:A\.0*x*[0-9a-f]{16}\.[A-Za-z]{3,}\:[0-9]{1,}/

type ParseFlowItemId = {
	blockchain: Blockchain
	collectionId: string
	flowItemId: number
}

export function parseUnionItemId(itemId: ItemId): ParseFlowItemId {
	if (FLOW_ITEM_ID_REGEXP.test(itemId)) {
		const divided = itemId.split(":")
		const blockchain = divided[0]
		if (blockchain !== "FLOW") {
			throw Error("Invalid item id, it is not FLOW item")
		}
		return {
			blockchain,
			collectionId: divided[1],
			flowItemId: parseInt(divided[2]),
		}
	}
	throw Error("Invalid item ID")
}

export function fromFlowItemIdToUnionItemId(flowItemId: number, flowCollection: string): ItemId {
	return toItemId(`FLOW:${flowCollection}:${flowItemId}`)
}

const FLOW_MAKER_ID_REGEXP = /^FLOW\:0*x*[0-9a-f]{16}/

export function parseFlowMaker(maker: UnionAddress) {
	if (FLOW_MAKER_ID_REGEXP.test(maker)) {
		return maker.split(":")[1]
	}
	throw Error("Invalid maker")
}

const FLOW_ORDER_ID_REGEXP = /^FLOW\:[0-9]{1,}/

export function parseOrderId(id: string): number {
	if (FLOW_ORDER_ID_REGEXP.test(id)) {
		return parseInt(id.split(":")[1])
	}
	throw Error("Invalid order ID")
}

const FLOW_FT_CONTRACT_REGEXP = /^FLOW\:A\.0*x*[0-9a-f]{16}\.[A-Za-z]{3,}/

export function getFungibleTokenName(contract: string): "FLOW" | "FUSD" {
	if (FLOW_FT_CONTRACT_REGEXP.test(contract)) {
		const name = contract.split(".")[2]
		switch (name) {
			case "FlowToken": {
				return "FLOW"
			}
			case "FUSD": {
				return "FUSD"
			}
			default: {
				throw Error("Unsupported contract ID")
			}
		}
	}
	throw Error("Unsupported contract ID")
}
