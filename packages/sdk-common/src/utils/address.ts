import type { AssetType, CollectionId, Creator, CurrencyId, ItemId, OrderId, OwnershipId } from "@rarible/api-client"
import type { ContractAddress, UnionAddress, Address } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { toAddress } from "@rarible/types"
import { isRealBlockchainSpecified } from "@rarible/types/build/blockchains"

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

export const FLOW_TOKEN_MAP = {
	testnet: "A.7e60df042a9c0868.FlowToken",
	prod: "A.1654653399040a61.FlowToken",
}
export function convertToEVMAddress(
	contractAddress: UnionAddress | ContractAddress | CollectionId,
): Address {
	if (!isRealBlockchainSpecified(contractAddress)) {
		throw new Error("Not a union or contract address: " + contractAddress)
	}

	const [blockchain, address] = contractAddress.split(":")
	if (!isEVMBlockchain(blockchain)) {
		throw new Error("Not an Ethereum address")
	}
	return toAddress(address)
}

export type EVMBlockchain = Blockchain.ETHEREUM | Blockchain.POLYGON | Blockchain.MANTLE
export const EVMBlockchains: EVMBlockchain[] = [
	Blockchain.ETHEREUM,
	Blockchain.POLYGON,
	Blockchain.MANTLE,
]

/**
 * Return true if blockchain works like ethereum blockchain
 * @param blockchain
 */
export function isEVMBlockchain(blockchain: string): blockchain is EVMBlockchain {
	for (const b of EVMBlockchains) {
		if (b === blockchain) {
			return true
		}
	}
	return false
}
