import type { AssetType, CollectionId, CurrencyId, ItemId, OrderId, OwnershipId } from "@rarible/api-client"
import type { ContractAddress, UnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"

export function extractBlockchainFromAssetType(assetType: AssetType): Blockchain | undefined {
	if (!assetType) {
		throw new Error("Asset type is expected")
	}
	if ("blockchain" in assetType && assetType.blockchain) {
		return assetType.blockchain
	}
	if ("contract" in assetType && assetType.contract) {
		return extractBlockchain(assetType.contract)
	}
}

const knownBlockchains = Object.values(Blockchain)
export type BlockchainIsh = UnionAddress | ContractAddress | ItemId | OrderId | OwnershipId | CollectionId | CurrencyId

export function extractBlockchain(value: BlockchainIsh): Blockchain {
	const idx = value.indexOf(":")
	if (idx === -1) {
		throw new Error(`Unable to extract blockchain from ${value}`)
	}
	const start = value.substring(0, idx)
	for (const blockchain of knownBlockchains) {
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

export function validateBlockchain(blockchain: string): Blockchain {
	if (!(blockchain in Blockchain)) {
		throw new Error(`Value: "${blockchain}" is not a supported blockchain type`)
	}
	return blockchain as Blockchain
}