import type { Part } from "@rarible/ethereum-api-client"
import type { CollectionId, Creator, Order } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { ContractAddress } from "@rarible/types/build/contract-address"
import { isRealBlockchainSpecified } from "@rarible/types/build/blockchains"
import { toAddress } from "@rarible/types"
import type { Address, UnionAddress } from "@rarible/types"
import type { PrepareFillRequest } from "../../../types/order/fill/domain"
import type { IApisSdk } from "../../../domain"
import type { UnionPart } from "../../../types/order/common"
import type { RequestCurrency } from "../../../common/domain"
import { getCurrencyAssetType } from "../../../common/get-currency-asset-type"


export async function getPreparedOrder(request: PrepareFillRequest, apis: IApisSdk): Promise<Order> {
	if ("order" in request) {
		return request.order
	}
	if ("orderId" in request) {
		return apis.order.getOrderById({ id: request.orderId })
	}
	throw new Error("Incorrect request")
}

export function convertToEthereumAddress(
	contractAddress: UnionAddress | ContractAddress | CollectionId
): Address {
	if (!isRealBlockchainSpecified(contractAddress)) {
		throw new Error("Not a union or contract address: " + contractAddress)
	}

	const [blockchain, address] = contractAddress.split(":")
	if (blockchain !== Blockchain.ETHEREUM && blockchain !== Blockchain.IMMUTABLEX) {
		throw new Error("Not an Ethereum/Immutablex address")
	}
	return toAddress(address)
}

export function unionPartsToParts(parts: UnionPart[] | Creator[] | undefined): Part[] {
	return parts?.map((part) => ({
		account: convertToEthereumAddress(part.account),
		value: part.value,
	})) || []
}

export function getTakeAssetType(currency: RequestCurrency) {
	const assetType = getCurrencyAssetType(currency)

	switch (assetType["@type"]) {
		case "ERC20":
			return {
				assetClass: assetType["@type"],
				contract: convertToEthereumAddress(assetType.contract),
			}
		case "ETH":
			return {
				assetClass: assetType["@type"],
			}
		default:
			throw new Error("Invalid take asset type")
	}
}
