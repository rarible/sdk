import type { FlowCurrency, FlowItemId as FlowItemIdSdk } from "@rarible/flow-sdk"
import { toFlowContractAddress } from "@rarible/flow-sdk"
import type { CollectionId, ItemId, OrderId, UnionContractAddress } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { ContractAddress, FlowAddress, UnionAddress, FlowContractAddress } from "@rarible/types"
import {
  toBigNumber,
  toCollectionId,
  toUnionContractAddress,
  toFlowAddress,
  toItemId,
  toOrderId,
  toUnionAddress,
  isBlockchainSpecified,
} from "@rarible/types"
import type { FlowFee } from "@rarible/flow-sdk"
import type { UnionPart } from "../../../../types/order/common"
import type { ParsedFlowItemIdFromUnionItemId } from "../domain"

const FLOW_COLLECTION_REGEXP = /^FLOW:A\.0*x*[0-9a-f]{16}\.[A-Za-z_]{3,}/

/**
 * Get flow collection from union collection
 * @param collection - e.g. "FLOW:A.0xabcdef0123456789.ContractName", contract address can be unprefixed
 */
export function getFlowCollection(collection: UnionContractAddress | CollectionId): FlowContractAddress {
  if (FLOW_COLLECTION_REGEXP.test(collection)) {
    const raw = collection.split(":")[1]
    return toFlowContractAddress(raw)
  }
  throw new Error("Invalid collection")
}

const FLOW_ITEM_ID_REGEXP = /^FLOW:A\.0*x*[0-9a-f]{16}\.[A-Za-z0-9]{3,}:[0-9]{1,}/

/**
 * Parse union item id
 * @param unionItemId - e.g. "FLOW:A.0xabcdef0123456789.ContractName:123", contract address can be unprefixed
 * @returns blockchain, collectionId, itemId
 */
export function parseFlowItemIdFromUnionItemId(unionItemId: ItemId): ParsedFlowItemIdFromUnionItemId {
  if (FLOW_ITEM_ID_REGEXP.test(unionItemId)) {
    const [blockchain, collectionId, itemId] = unionItemId.split(":")
    if (!collectionId) {
      throw new Error("Invalid collection id, identifier is empty")
    }
    if (!itemId) {
      throw new Error("Invalid item id, identifier is empty")
    }
    if (blockchain === Blockchain.FLOW) {
      return {
        blockchain: Blockchain.FLOW,
        contract: toFlowContractAddress(collectionId),
        itemId,
      }
    }
    throw new Error(`Invalid item id, "${blockchain}" is not FLOW item`)
  }
  throw new Error("Invalid item ID")
}

const FLOW_MAKER_ID_REGEXP = /^FLOW:0*x*[0-9a-f]{16}/

/**
 * Get maker account address
 * @param maker - "FLOW:0xabcdef0123456789", address can be unprefixed
 */
export function parseFlowAddressFromUnionAddress(maker: UnionAddress): FlowAddress {
  if (FLOW_MAKER_ID_REGEXP.test(maker)) {
    const rawAddress = maker.split(":")[1]
    if (!rawAddress.startsWith("0x")) return toFlowAddress(`0x${rawAddress}`)
    return toFlowAddress(rawAddress)
  }
  throw new Error("Invalid maker")
}

const FLOW_ORDER_ID_REGEXP = /^FLOW:[0-9]{1,}/

/**
 *
 * @param id - "FLOW:{any count of digits}"
 */
export function parseOrderId(id: string): string {
  if (FLOW_ORDER_ID_REGEXP.test(id)) {
    return id.split(":")[1]
  }
  throw new Error("Invalid order ID")
}

const FLOW_FT_CONTRACT_REGEXP = /^FLOW:A\.0*x*[0-9a-f]{16}\.[A-Za-z]{3,}/

/**
 * Get fungible token name
 * @param contract - e.g. "FLOW:A.0xabcdef0123456789.ContractName", contract address can be unprefixed
 */
export function getFungibleTokenName(contract: UnionContractAddress): FlowCurrency {
  if (FLOW_FT_CONTRACT_REGEXP.test(contract)) {
    const [, , name] = contract.split(".")
    switch (name) {
      case "FlowToken":
        return "FLOW"
      case "FUSD":
        return "FUSD"
      case "FiatToken":
        return "USDC"
      default:
        throw new Error(`Unsupported contract ID: ${contract}`)
    }
  }
  throw new Error(`Unsupported contract ID: ${contract}`)
}

export function convertToFlowAddress(contractAddress: UnionAddress | ContractAddress): FlowAddress {
  if (!isBlockchainSpecified(contractAddress)) {
    throw new Error("Not a union or contract address: " + contractAddress)
  }

  const [blockchain, address] = contractAddress.split(":")
  if (blockchain !== Blockchain.FLOW) {
    throw new Error("Not an Flow address")
  }
  return toFlowAddress(address)
}

export function toFlowParts(parts: UnionPart[] | undefined): FlowFee[] {
  return (
    parts?.map(p => {
      return {
        account: convertToFlowAddress(p.account),
        value: toBigNumber(p.value.toString()),
      }
    }) || []
  )
}

export function convertFlowOrderId(orderId: string): OrderId {
  return toOrderId(`${Blockchain.FLOW}:${orderId}`)
}

export function convertFlowItemId(itemId: FlowItemIdSdk): ItemId {
  return toItemId(`${Blockchain.FLOW}:${itemId}`)
}

export function convertFlowContractAddress(contractAddress: string): UnionContractAddress {
  return toUnionContractAddress(`${Blockchain.FLOW}:${contractAddress}`)
}

export function convertFlowCollectionId(contractAddress: string): CollectionId {
  return toCollectionId(`${Blockchain.FLOW}:${contractAddress}`)
}

export function convertFlowUnionAddress(address: string): UnionAddress {
  return toUnionAddress(`${Blockchain.FLOW}:${address}`)
}
