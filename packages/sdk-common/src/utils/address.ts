import type { AssetType, CollectionId, CurrencyId, ItemId, OrderId, OwnershipId } from "@rarible/api-client"
import type { ContractAddress, UnionAddress } from "@rarible/types"
import type { SupportedBlockchain } from "./blockchain"
import { SupportedBlockchains } from "./blockchain"

export function extractBlockchainFromAssetType(assetType: AssetType): SupportedBlockchain | undefined {
	if (!assetType) {
		throw new Error("Asset type is expected")
	}
	if ("blockchain" in assetType && assetType.blockchain) {
		return validateBlockchain(assetType.blockchain)
	}
	if ("contract" in assetType && assetType.contract) {
		return extractBlockchain(assetType.contract)
	}
}

export type BlockchainIsh = UnionAddress | ContractAddress | ItemId | OrderId | OwnershipId | CollectionId | CurrencyId

export function extractBlockchain(value: BlockchainIsh): SupportedBlockchain {
	const idx = value.indexOf(":")
	if (idx === -1) {
		throw new Error(`Unable to extract blockchain from ${value}`)
	}
	const start = value.substring(0, idx)
	for (const blockchain of SupportedBlockchains) {
		if (blockchain === start) {
			return blockchain
		}
	}
	throw new Error(`Unable to extract blockchain from ${value}`)
}

export function extractId(value: BlockchainIsh) {
	const idx = value.indexOf(":")
	if (idx === -1) throw new Error(`Unable to extract blockchain from ${value}`)
	return value.substring(idx + 1)
}

export function getEntityData(entity: UnionAddress | ContractAddress | string) {
	if (!entity) {
		throw new Error("Entity has not been specified")
	}
	const [blockchain, address] = entity.split(":")
	return {
		blockchain: validateBlockchain(blockchain),
		address,
	}
}

export function validateBlockchain(blockchain: string): SupportedBlockchain {
	if (!isSupportedBlockchain(blockchain)) {
		throw new Error(`Value: "${blockchain}" is not a supported blockchain type`)
	}
	return blockchain
}

export const FLOW_TOKEN_MAP = {
	testnet: "A.7e60df042a9c0868.FlowToken",
	prod: "A.1654653399040a61.FlowToken",
}

export function isSupportedBlockchain(blockchain: string): blockchain is SupportedBlockchain {
	return SupportedBlockchains.includes(blockchain as SupportedBlockchain)
}
