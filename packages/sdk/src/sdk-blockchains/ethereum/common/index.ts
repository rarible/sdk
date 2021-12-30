import type { Address, UnionAddress, Word } from "@rarible/types"
import { toAddress, toContractAddress, toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import { isRealBlockchainSpecified } from "@rarible/types/build/blockchains"
import type { AssetType, ItemId, OrderId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { UnionPart } from "packages/sdk/src/types/order/common"
import type { Erc20AssetType, EthAssetType, Part } from "@rarible/ethereum-api-client"
import type { ContractAddress } from "@rarible/types/build/contract-address"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { CurrencyType, RequestCurrency } from "../../../common/domain"

export type EVMBlockchain = Blockchain.ETHEREUM | Blockchain.POLYGON
export const EVMBlockchains: EVMBlockchain[] = [
	Blockchain.ETHEREUM,
	Blockchain.POLYGON,
]

export function getEthTakeAssetType(currency: RequestCurrency) {
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

export function convertToEthereumAssetType(assetType: AssetType): EthAssetType | Erc20AssetType {
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
		default: {
			throw new Error(`Unsupported asset type=${assetType["@type"]}`)
		}
	}
}
export function toEthereumParts(parts: UnionPart[] | undefined): Part[] {
	return parts?.map((fee) => ({
		account: convertToEthereumAddress(fee.account),
		value: fee.value,
	})) || []
}

export function getEVMBlockchain(network: EthereumNetwork): EVMBlockchain {
	switch (network) {
		case "e2e":
			return Blockchain.ETHEREUM
		case "ropsten":
			return Blockchain.ETHEREUM
		case "rinkeby":
			return Blockchain.ETHEREUM
		case "mainnet":
			return Blockchain.ETHEREUM
		case "mumbai":
			return Blockchain.POLYGON
		case "polygon":
			return Blockchain.POLYGON
		default:
			throw new Error(`Unsupported network: ${network}`)
	}
}

export function getSupportedCurrencies(blockchain: EVMBlockchain = Blockchain.ETHEREUM): CurrencyType[] {
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
	contractAddress: UnionAddress | ContractAddress
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

export function convertEthereumContractAddress(address: string, blockchain: EVMBlockchain): ContractAddress {
	return toContractAddress(`${blockchain}:${address}`)
}

export function convertEthereumUnionAddress(address: string, blockchain: EVMBlockchain): UnionAddress {
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
