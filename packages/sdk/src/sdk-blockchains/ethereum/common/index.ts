import type { Address, UnionAddress, Word } from "@rarible/types"
import {
	toAddress,
	toBigNumber,
	toBinary, toCollectionId,
	toContractAddress,
	toItemId,
	toOrderId,
	toUnionAddress,
} from "@rarible/types"
import { isRealBlockchainSpecified } from "@rarible/types/build/blockchains"
import type { AssetType, CollectionId, Creator, ItemId, OrderId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { UnionPart } from "packages/sdk/src/types/order/common"
import type { ContractAddress } from "@rarible/types/build/contract-address"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { toBn } from "@rarible/utils/build/bn"
import type { AssetType as EthereumAssetType, Part } from "@rarible/ethereum-api-client"
import type { Order } from "@rarible/ethereum-api-client/build/models"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { CurrencyType } from "../../../common/domain"
import type { RequestCurrencyAssetType } from "../../../common/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../../types/order/fill/domain"

export type EVMBlockchain = Blockchain.ETHEREUM | Blockchain.POLYGON
export const EVMBlockchains: EVMBlockchain[] = [
	Blockchain.ETHEREUM,
	Blockchain.POLYGON,
]

export type CreateEthereumCollectionResponse = { tx: EthereumTransaction, address: Address }

export function getEthTakeAssetType(currency: RequestCurrencyAssetType) {
	switch (currency["@type"]) {
		case "ERC20":
			return {
				assetClass: currency["@type"],
				contract: convertToEthereumAddress(currency.contract),
			}
		case "ETH":
			return {
				assetClass: currency["@type"],
			}
		default:
			throw new Error("Invalid take asset type")
	}
}

export function convertToEthereumAssetType(assetType: AssetType): EthereumAssetType {
	switch (assetType["@type"]) {
		case "ETH": {
			return { assetClass: "ETH" }
		}
		case "ERC20": {
			return {
				assetClass: "ERC20",
				contract: convertToEthereumAddress(assetType.contract),
			}
		}
		case "ERC721": {
			return {
				assetClass: "ERC721",
				contract: convertToEthereumAddress(assetType.contract),
				tokenId: assetType.tokenId,
			}
		}
		case "ERC721_Lazy": {
			return {
				assetClass: "ERC721_LAZY",
				contract: convertToEthereumAddress(assetType.contract),
				tokenId: assetType.tokenId,
				uri: assetType.uri,
				creators: assetType.creators.map(c => ({
					account: convertToEthereumAddress(c.account),
					value: toBn(c.value).toNumber(),
				})),
				royalties: assetType.royalties.map(r => ({
					account: convertToEthereumAddress(r.account),
					value: toBn(r.value).toNumber(),
				})),
				signatures: assetType.signatures.map(str => toBinary(str)),
			}
		}
		case "ERC1155": {
			return {
				assetClass: "ERC1155",
				contract: convertToEthereumAddress(assetType.contract),
				tokenId: assetType.tokenId,
			}
		}
		case "ERC1155_Lazy": {
			return {
				assetClass: "ERC1155_LAZY",
				contract: convertToEthereumAddress(assetType.contract),
				tokenId: assetType.tokenId,
				uri: assetType.uri,
				supply: assetType.supply !== undefined ? toBigNumber(assetType.supply) : toBigNumber("1"),
				creators: assetType.creators.map(c => ({
					account: convertToEthereumAddress(c.account),
					value: toBn(c.value).toNumber(),
				})),
				royalties: assetType.royalties.map(r => ({
					account: convertToEthereumAddress(r.account),
					value: toBn(r.value).toNumber(),
				})),
				signatures: assetType.signatures.map(str => toBinary(str)),
			}
		}
		case "CRYPTO_PUNKS": {
			return {
				assetClass: "CRYPTO_PUNKS",
				contract: convertToEthereumAddress(assetType.contract),
				tokenId: assetType.tokenId,
			}
		}
		case "GEN_ART": {
			return {
				assetClass: "GEN_ART",
				contract: convertToEthereumAddress(assetType.contract),
			}
		}
		default: {
			throw new Error(`Unsupported asset type=${assetType["@type"]}`)
		}
	}
}

export function toEthereumParts(parts: UnionPart[] | Creator[] | undefined): Part[] {
	return parts?.map((part) => ({
		account: convertToEthereumAddress(part.account),
		value: part.value,
	})) || []
}

export function getOriginFeesSum(originFees: Array<Part>): number {
	return originFees.reduce((acc, fee) => fee.value, 0)
}

export function getOrderFeesSum(order: Order): number {
	switch (order.data.dataType) {
		case "LEGACY":
			return order.data.fee
		case "RARIBLE_V2_DATA_V1":
			return getOriginFeesSum(order.data.originFees)
		case "RARIBLE_V2_DATA_V2":
			return getOriginFeesSum(order.data.originFees)
		default:
			throw new Error("Unexpected order dataType")
	}
}

export function getOriginFeeSupport(type: "RARIBLE_V1" | "RARIBLE_V2"): OriginFeeSupport {
	switch (type) {
		case "RARIBLE_V1":
			return OriginFeeSupport.AMOUNT_ONLY
		case "RARIBLE_V2":
			return OriginFeeSupport.FULL
		default:
			throw new Error("Unknown order type " + type)
	}
}

export function getPayoutsSupport(type: "RARIBLE_V1" | "RARIBLE_V2"): PayoutsSupport {
	switch (type) {
		case "RARIBLE_V1":
			return PayoutsSupport.SINGLE
		case "RARIBLE_V2":
			return PayoutsSupport.MULTIPLE
		default:
			throw new Error("Unknown order type " + type)
	}
}

export function getEVMBlockchain(network: EthereumNetwork): EVMBlockchain {
	switch (network) {
		case "testnet":
			return Blockchain.ETHEREUM
		case "ropsten":
			return Blockchain.ETHEREUM
		case "dev-ethereum":
			return Blockchain.ETHEREUM
		case "dev-polygon":
			return Blockchain.POLYGON
		case "rinkeby":
			return Blockchain.ETHEREUM
		case "mainnet":
			return Blockchain.ETHEREUM
		case "mumbai":
			return Blockchain.POLYGON
		case "mumbai-dev":
			return Blockchain.POLYGON
		case "polygon":
			return Blockchain.POLYGON
		default:
			throw new Error(`Unsupported network: ${network}`)
	}
}

export function getSupportedCurrencies(
	blockchain: EVMBlockchain = Blockchain.ETHEREUM,
	forBids: boolean = false,
): CurrencyType[] {
	if (forBids) {
		return [{ blockchain, type: "ERC20" }]
	}
	return [
		{ blockchain, type: "NATIVE" },
		{ blockchain, type: "ERC20" },
	]
}

export function isEVMBlockchain(blockchain: string): blockchain is EVMBlockchain {
	for (const b of EVMBlockchains) {
		if (b === blockchain) {
			return true
		}
	}
	return false
}

export function convertToEthereumAddress(
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

export function convertEthereumOrderHash(hash: Word, blockchain: EVMBlockchain): OrderId {
	return toOrderId(`${blockchain}:${hash}`)
}

export function convertOrderIdToEthereumHash(orderId: OrderId): string {
	if (!isRealBlockchainSpecified(orderId)) {
		throw new Error(`Blockchain is not correct=${orderId}`)
	}

	const [blockchain, orderHash] = orderId.split(":")
	if (!isEVMBlockchain(blockchain)) {
		throw new Error("Not an Ethereum address")
	}
	return orderHash
}

export function convertEthereumContractAddress(address: string, blockchain: EVMBlockchain): ContractAddress {
	return toContractAddress(`${blockchain}:${address}`)
}

export function convertEthereumCollectionId(address: string, blockchain: EVMBlockchain): CollectionId {
	return toCollectionId(`${blockchain}:${address}`)
}

export function convertEthereumToUnionAddress(address: string, blockchain: EVMBlockchain): UnionAddress {
	return toUnionAddress(`${blockchain}:${address}`)
}

export function convertEthereumItemId(itemId: string, blockchain: EVMBlockchain): ItemId {
	return toItemId(`${blockchain}:${itemId}`)
}

export function getEthereumItemId(itemId: ItemId) {
	const [domain, contract, tokenId] = itemId.split(":")
	if (!isEVMBlockchain(domain)) {
		throw new Error(`Not an ethereum item: ${itemId}`)
	}
	return {
		itemId: `${contract}:${tokenId}`,
		contract,
		tokenId,
		domain,
	}
}

export * from "./validators"
