import type { Address, BigNumber } from "@rarible/types"
import { toAddress, toBigNumber, toBinary, ZERO_ADDRESS } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { Ethereum } from "@rarible/ethereum-provider"
import { toBn } from "@rarible/utils"
import { convertToEVMAddress } from "@rarible/sdk-common"
import { isNft } from "../is-nft"
import type { SimpleOpenSeaV1Order, SimpleOrder } from "../types"
import { convertDateStringToNumber } from "../../common"
import type { OpenSeaOrderDTO } from "./open-sea-types"
import {
	OrderOpenSeaV1DataV1FeeMethod,
	OrderOpenSeaV1DataV1HowToCall,
	OrderOpenSeaV1DataV1SaleKind,
	OrderOpenSeaV1DataV1Side,
} from "./open-sea-types"

export function convertOpenSeaOrderToDTO(ethereum: Ethereum, order: SimpleOpenSeaV1Order): OpenSeaOrderDTO {
	const paymentToken = getPaymentTokenAddress(order)
	if (!paymentToken) {
		throw new Error("Maker or taker should have an ERC20 asset")
	}

	const nftAddress = getNftAddress(order)
	if (!nftAddress) {
		throw new Error("Maker or taker should have an NFT asset")
	}

	const callData = order.data.callData
	const replacementPattern = order.data.replacementPattern
	let basePrice: BigNumber
	const makeAssetType = order.make.type
	const takeAssetType = order.take.type

	if (makeAssetType["@type"] === "ERC721") {
		basePrice = toBigNumber(order.take.value)
	} else if (makeAssetType["@type"] === "ERC1155") {
		basePrice = toBigNumber(order.take.value)
	} else if (takeAssetType["@type"] === "ERC721") {
		basePrice = toBigNumber(order.make.value)
	} else if (takeAssetType["@type"] === "ERC1155") {
		basePrice = toBigNumber(order.make.value)
	} else {
		throw new Error("should never happen")
	}

	return {
		exchange: toAddress(order.data.exchange),
		maker: toAddress(order.maker),
		taker: toAddress(order.taker || ZERO_ADDRESS),
		makerRelayerFee: toBigNumber(order.data.makerRelayerFee),
		takerRelayerFee: toBigNumber(order.data.takerRelayerFee),
		makerProtocolFee: toBigNumber(order.data.makerProtocolFee),
		takerProtocolFee: toBigNumber(order.data.takerProtocolFee),
		feeRecipient: convertToEVMAddress(order.data.feeRecipient),
		feeMethod: OrderOpenSeaV1DataV1FeeMethod[order.data.feeMethod],
		side: OrderOpenSeaV1DataV1Side[order.data.side],
		saleKind: OrderOpenSeaV1DataV1SaleKind[order.data.saleKind],
		target: nftAddress,
		howToCall: OrderOpenSeaV1DataV1HowToCall[order.data.howToCall],
		calldata: toBinary(callData),
		replacementPattern: toBinary(replacementPattern),
		staticTarget: convertToEVMAddress(order.data.staticTarget),
		staticExtradata: toBinary(order.data.staticExtraData),
		paymentToken,
		basePrice,
		extra: toBigNumber(order.data.extra),
		listingTime: toBigNumber(String(convertDateStringToNumber(order.startedAt))),
		expirationTime: toBigNumber(String(convertDateStringToNumber(order.endedAt))),
		salt: toBigNumber(toBn(order.salt).toString(10)),
	}
}

export const ERC721_MAKE_REPLACEMENT =
	toBinary("0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000")

export const ERC721_VALIDATOR_MAKE_REPLACEMENT =
  toBinary("0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")

export const ERC721_TAKE_REPLACEMENT =
	toBinary("0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")

export const ERC721_VALIDATOR_TAKE_REPLACEMENT =
	toBinary("0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")

export const ERC1155_MAKE_REPLACEMENT =
	toBinary("0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")

export const ERC1155_VALIDATOR_MAKE_REPLACEMENT =
	toBinary("0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")

export const ERC1155_TAKE_REPLACEMENT =
	toBinary("0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")

export const ERC1155_VALIDATOR_TAKE_REPLACEMENT =
	toBinary("0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")


function getPaymentTokenAddress(order: SimpleOrder): Address | undefined {
	const makePaymentToken = extractPaymentTokenAddress(order.make.type)
	if (makePaymentToken !== undefined) {
		return makePaymentToken
	}
	const takePaymentToken = extractPaymentTokenAddress(order.take.type)
	if (takePaymentToken !== undefined) {
		return takePaymentToken
	}
	return undefined
}

function extractPaymentTokenAddress(assetType: AssetType): Address | undefined {
	switch (assetType["@type"]) {
		case "ETH": return ZERO_ADDRESS
		case "ERC20": return convertToEVMAddress(assetType.contract)
		default: return undefined
	}
}

function getNftAddress(order: SimpleOrder): Address | undefined {
	if (isNft(order.make.type)) {
		return convertToEVMAddress(order.make.type.contract)
	}
	if (isNft(order.take.type)) {
		return convertToEVMAddress(order.take.type.contract)
	}
	return undefined
}
