import { ItemId } from "@rarible/api-client"
import { UnionAddress } from "@rarible/types"
import { withPrefix } from "@rarible/flow-sdk/build/common/utils"
import { FlowItemId } from "../../../common/domain"


const FLOW_COLLECTION_REGEXP = /^FLOW\:A\.0*x*[0-9a-f]{16}\.[A-Za-z]{3,}/

/**
 * Get flow collection from union collection
 * @param collection - e.g. "FLOW:A.0xabcdef0123456789.ContractName", contract address can be unprefixed
 */
export function getFlowCollection(collection: string): string {
	if (FLOW_COLLECTION_REGEXP.test(collection)) {
		return collection.split(":")[1]
	}
	throw Error("Invalid collection")
}

const FLOW_ITEM_ID_REGEXP = /^FLOW\:A\.0*x*[0-9a-f]{16}\.[A-Za-z]{3,}\:[0-9]{1,}/

// type FlowItemId = {
// 	blockchain: Blockchain
// 	collectionId: string
// 	itemId: string
// }

/**
 * Parse union item id
 * @param unionItemId - e.g. "FLOW:A.0xabcdef0123456789.ContractName:123", contract address can be unprefixed
 * @returns blockchain, collectionId, itemId
 */
export function parseUnionItemId(unionItemId: ItemId): FlowItemId {
	if (FLOW_ITEM_ID_REGEXP.test(unionItemId)) {
		const [blockchain, collectionId, itemId] = unionItemId.split(":")
		if (blockchain !== "FLOW") {
			throw Error(`Invalid item id, "${blockchain}" is not FLOW item`)
		}
		if (!collectionId) {
			throw Error("Invalid collection id, identifier is empty")
		}
		if (!itemId) {
			throw Error("Invalid item id, identifier is empty")
		}
		return {
			blockchain,
			collectionId,
			itemId,
		}
	}
	throw Error("Invalid item ID")
}

const FLOW_MAKER_ID_REGEXP = /^FLOW\:0*x*[0-9a-f]{16}/

/**
 * Get maker account address
 * @param maker - "FLOW:0xabcdef0123456789", address can be unprefixed
 */
export function parseFlowMaker(maker: UnionAddress) {
	if (FLOW_MAKER_ID_REGEXP.test(maker)) {
		const address = withPrefix(maker.split(":")[1])
		if (address) {
			return address
		}
		throw Error("Invalid maker address")
	}
	throw Error("Invalid maker")
}

const FLOW_ORDER_ID_REGEXP = /^FLOW\:[0-9]{1,}/

/**
 *
 * @param id - "FLOW:{any count of digits}"
 */
export function parseOrderId(id: string): string {
	if (FLOW_ORDER_ID_REGEXP.test(id)) {
		return id.split(":")[1]
	}
	throw Error("Invalid order ID")
}

const FLOW_FT_CONTRACT_REGEXP = /^FLOW\:A\.0*x*[0-9a-f]{16}\.[A-Za-z]{3,}/

/**
 * Get fungible token name
 * @param contract - e.g. "FLOW:A.0xabcdef0123456789.ContractName", contract address can be unprefixed
 */
export function getFungibleTokenName(contract: string): "FLOW" | "FUSD" {
	if (FLOW_FT_CONTRACT_REGEXP.test(contract)) {
		const [_, __, name] = contract.split(".")
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
