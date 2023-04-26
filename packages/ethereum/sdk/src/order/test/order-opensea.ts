import type { Asset } from "@rarible/ethereum-api-client"
import {
	OrderOpenSeaV1DataV1FeeMethod,
	OrderOpenSeaV1DataV1HowToCall,
	OrderOpenSeaV1DataV1SaleKind,
	OrderOpenSeaV1DataV1Side,
} from "@rarible/ethereum-api-client"
import { toAddress, toBigNumber, toBinary, toWord, ZERO_ADDRESS } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import { ethers } from "ethers"
// import { Seaport } from "@opensea/seaport-js"
// import type { ConsiderationInputItem, CreateInputItem } from "@opensea/seaport-js/lib/types"
import axios from "axios"
import type { OpenSeaOrderDTO } from "../fill-order/open-sea-types"
import type { SimpleOpenSeaV1Order } from "../types"
import { convertOpenSeaOrderToDTO } from "../fill-order/open-sea-converter"
import type { ConsiderationInputItem, CreateInputItem } from "../fill-order/seaport-utils/types"
import { createOrder } from "../fill-order/seaport-utils/create-order"
import type { SendFunction } from "../../common/send-transaction"

function getRandomTokenId(): string {
	return Math.floor(Math.random() * 300000000).toFixed()
}

export function getAssetTypeBlank(assetClass: string): Asset {
	switch (assetClass) {
		case "ETH": {
			return {
				assetType: {
					assetClass: "ETH",
				},
				value: toBigNumber("100"),
			}
		}
		case "ERC20": {
			return {
				assetType: {
					assetClass: "ERC20",
					contract: toAddress(ZERO_ADDRESS),
				},
				value: toBigNumber("100"),
			}
		}
		case "ERC721": {
			return {
				assetType: {
					assetClass: "ERC721",
					contract: toAddress(ZERO_ADDRESS),
					tokenId: toBigNumber(getRandomTokenId()),
				},
				value: toBigNumber("1"),
			}
		}
		case "ERC1155": {
			return {
				assetType: {
					assetClass: "ERC1155",
					contract: toAddress(ZERO_ADDRESS),
					tokenId: toBigNumber(getRandomTokenId()),
				},
				value: toBigNumber("100"),
			}
		}
		default:
			throw new Error("Unrecognized asset type")
	}
}

export const OPENSEA_ORDER_TEMPLATE: Omit<SimpleOpenSeaV1Order, "make" | "take"> = {
	maker: toAddress(ZERO_ADDRESS),
	salt: toWord("0x000000000000000000000000000000000000000000000000000000000000000a"),
	type: "OPEN_SEA_V1",
	start: 0,
	end: 0,
	data: {
		dataType: "OPEN_SEA_V1_DATA_V1",
		exchange: toAddress(ZERO_ADDRESS),
		makerRelayerFee: toBigNumber("0"),
		takerRelayerFee: toBigNumber("0"),
		makerProtocolFee: toBigNumber("0"),
		takerProtocolFee: toBigNumber("0"),
		feeRecipient: toAddress(ZERO_ADDRESS),
		feeMethod: OrderOpenSeaV1DataV1FeeMethod.SPLIT_FEE,
		side: OrderOpenSeaV1DataV1Side.SELL,
		saleKind: OrderOpenSeaV1DataV1SaleKind.FIXED_PRICE,
		howToCall: OrderOpenSeaV1DataV1HowToCall.CALL,
		callData: toBinary("0x"),
		replacementPattern: toBinary("0x"),
		staticTarget: ZERO_ADDRESS,
		staticExtraData: toBinary("0x"),
		extra: toBigNumber("0"),
	},
}

export type TestAssetClass = "ETH" | "ERC20" | "ERC721" | "ERC1155"

export function getOrderTemplate(
	makeAsset: TestAssetClass, takeAsset: TestAssetClass, side: OrderOpenSeaV1DataV1Side,
): SimpleOpenSeaV1Order {

	return {
		...OPENSEA_ORDER_TEMPLATE,
		make: getAssetTypeBlank(makeAsset),
		take: getAssetTypeBlank(takeAsset),
		data: {
			...OPENSEA_ORDER_TEMPLATE.data,
			callData: toBinary("0xf242432a00000000000000000000000000d5cbc289e4b66a6252949d6eb6ebbb12df24ab00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000"),
			replacementPattern: toBinary("0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"),
			side,
		},
	}

}

//TODO replace web3.eth.sign
export async function getOrderSignature(ethereum: Ethereum, order: SimpleOpenSeaV1Order): Promise<string> {
	const web3: any = (ethereum as any)["config"].web3
	const from = await ethereum.getFrom()
	// return ethereum.ethSign(hashOpenSeaV1Order(ethereum, order))
	return web3.eth.sign(hashOpenSeaV1Order(ethereum, order), from)
}


const hashOrderType = [
	"address",
	"address",
	"address",
	"uint",
	"uint",
	"uint",
	"uint",
	"address",
	"uint8",
	"uint8",
	"uint8",
	"address",
	"uint8",
	"bytes",
	"bytes",
	"address",
	"bytes",
	"address",
	"uint",
	"uint",
	"uint",
	"uint",
	"uint",
]

export function hashOrder(order: OpenSeaOrderDTO): string {
	return ethers.utils.solidityKeccak256(hashOrderType, [
		order.exchange,
		order.maker,
		order.taker,
		order.makerRelayerFee,
		order.takerRelayerFee,
		order.makerProtocolFee,
		order.takerProtocolFee,
		order.feeRecipient,
		order.feeMethod,
		order.side,
		order.saleKind,
		order.target,
		order.howToCall,
		order.calldata,
		order.replacementPattern,
		order.staticTarget,
		order.staticExtradata,
		order.paymentToken,
		order.basePrice,
		order.extra,
		order.listingTime,
		order.expirationTime,
		order.salt,
	])
}

export function hashToSign(hash: string): string {
	return ethers.utils.solidityKeccak256(
		["string", "bytes32"],
		["\x19Ethereum Signed Message:\n32", hash],
	)
}

export function hashOpenSeaV1Order(ethereum: Ethereum, order: SimpleOpenSeaV1Order): string {
	return hashOrder(convertOpenSeaOrderToDTO(ethereum, order))
}

export async function createSeaportOrder(
	provider: Ethereum,
	send: SendFunction,
	make: CreateInputItem,
	take: ConsiderationInputItem[],
	options?: {allowPartialFills: boolean}
) {

	const o = {
		...(options || {}),
	}

	const endTime = getMaxOrderExpirationTimestamp().toString()
	 const createdOrder = await createOrder(
		provider,
		{
			send,
			"offer": [make],
			"consideration": take,
			startTime: undefined,
			endTime,
			//rinkeby
			zone: "0x00000000e88fe2628ebc5da81d2b3cead633e89e",
			restrictedByZone: true,
			allowPartialFills: o.allowPartialFills !== undefined ? o.allowPartialFills : true,
		})

	let orderHash = ""
	try {
		const { data } = await axios.post("https://testnets-api.opensea.io/v2/orders/rinkeby/seaport/listings", createdOrder)
		orderHash = data.order.order_hash
	} catch (e: any) {
		throw e
	}
	return orderHash
}

export const getMaxOrderExpirationTimestamp = () => {
	const maxExpirationDate = new Date()

	maxExpirationDate.setMonth(
		maxExpirationDate.getMonth() + 1
	)
	maxExpirationDate.setDate(maxExpirationDate.getDate() - 1)

	return Math.round(maxExpirationDate.getTime() / 1000)
}
