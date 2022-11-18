import type { Asset, Binary, EIP712Domain } from "@rarible/ethereum-api-client"
import type { Address } from "@rarible/types"
import { toBinary, ZERO_ADDRESS } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import { TypedDataUtils } from "eth-sig-util"
import type { EthereumConfig } from "../config/type"
import { hashLegacyOrder } from "./hash-legacy-order"
import { assetTypeToStruct } from "./asset-type-to-struct"
import { EIP712_DOMAIN_TEMPLATE, EIP712_ORDER_TYPE, EIP712_ORDER_TYPES } from "./eip712"
import { encodeRaribleV2OrderData } from "./encode-rarible-v2-order-data"
import type { SimpleOrder, SimpleRaribleV2Order } from "./types"

export async function signOrder(
	ethereum: Maybe<Ethereum>,
	config: Pick<EthereumConfig, "exchange" | "chainId">,
	order: SimpleOrder
): Promise<Binary> {
	if (!ethereum) {
		throw new Error("Wallet undefined")
	}
	switch (order.type) {
		case "RARIBLE_V1": {
			const legacyHash = hashLegacyOrder(ethereum, order)
			return toBinary(await ethereum.personalSign(legacyHash.substring(2)))
		}
		case "RARIBLE_V2": {
			const domain = createEIP712Domain(config.chainId, config.exchange.v2)
			const signature = await ethereum.signTypedData({
				primaryType: EIP712_ORDER_TYPE,
				domain,
				types: EIP712_ORDER_TYPES,
				message: orderToStruct(ethereum, order),
			})
			return toBinary(signature)
		}
		default: {
			throw new Error(`Unsupported order type: ${(order as any).type}`)
		}
	}
}

export function hashToSign(config: Pick<EthereumConfig, "exchange" | "chainId">, ethereum: Ethereum, order: SimpleRaribleV2Order) {
	const domain = createEIP712Domain(config.chainId, config.exchange.v2)
	return TypedDataUtils.sign({
		primaryType: EIP712_ORDER_TYPE,
		domain,
		types: EIP712_ORDER_TYPES,
		message: orderToStruct(ethereum, order),
	})
}

function createEIP712Domain(chainId: number, verifyingContract: Address): EIP712Domain {
	return {
		...EIP712_DOMAIN_TEMPLATE,
		verifyingContract: verifyingContract,
		chainId,
	}
}

export function orderToStruct(ethereum: Ethereum, order: SimpleRaribleV2Order, wrongEncode: Boolean = false): any {
	const [dataType, data] = encodeRaribleV2OrderData(ethereum, order.data, wrongEncode)
	return {
		maker: order.maker,
		makeAsset: assetToStruct(ethereum, order.make),
		taker: order.taker ?? ZERO_ADDRESS,
		takeAsset: assetToStruct(ethereum, order.take),
		salt: order.salt,
		start: order.start ?? 0,
		end: order.end ?? 0,
		dataType,
		data,
	}
}

function assetToStruct(ethereum: Ethereum, asset: Asset) {
	return {
		assetType: assetTypeToStruct(ethereum, asset.assetType),
		value: asset.value,
	}
}
