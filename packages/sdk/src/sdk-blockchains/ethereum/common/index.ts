import type { Address, UnionAddress, Word } from "@rarible/types"
import { toAddress, toContractAddress, toOrderId } from "@rarible/types"
import { isBlockchainSpecified } from "@rarible/types/build/blockchains"
import type { OrderId } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { UnionPart } from "packages/sdk/src/types/order/common"
import type { Part } from "@rarible/ethereum-api-client"
import type { ContractAddress } from "@rarible/types/build/contract-address"
import type { CurrencyType, RequestCurrency } from "../../../common/domain"

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

export function toEthereumParts(parts: UnionPart[] | undefined): Part[] {
	return parts?.map((fee) => ({
		account: convertToEthereumAddress(fee.account),
		value: fee.value,
	})) || []
}

export function getSupportedCurrencies(): CurrencyType[] {
	return [
		{ blockchain: Blockchain.ETHEREUM, type: "NATIVE" },
		{ blockchain: Blockchain.ETHEREUM, type: "ERC20" },
	]
}

export function convertToEthereumAddress(
	contractAddress: UnionAddress | ContractAddress
): Address {
	if (!isBlockchainSpecified(contractAddress)) {
		throw new Error("Not a union or contract address: " + contractAddress)
	}

	const [blockchain, address] = contractAddress.split(":")
	if (blockchain !== "ETHEREUM") {
		throw new Error("Not an Ethereum address")
	}
	return toAddress(address)
}

export function convertOrderHashToOrderId(hash: Word): OrderId {
	return toOrderId(`ETHEREUM:${hash}`)
}

export function convertToEthereumContractAddress(address: string): ContractAddress {
	return toContractAddress(`ETHEREUM:${address}`)
}
