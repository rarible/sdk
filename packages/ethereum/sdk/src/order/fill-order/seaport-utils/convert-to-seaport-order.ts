import type { SimpleSeaportV1Order } from "../../types"
import { convertItemType, convertOrderType } from "../seaport"
import type { OrderWithCounter } from "./types"
import { CROSS_CHAIN_SEAPORT_ADDRESS } from "./constants"

export function convertAPIOrderToSeaport(order: SimpleSeaportV1Order): OrderWithCounter {
	if (order.data.protocol !== CROSS_CHAIN_SEAPORT_ADDRESS) {
		throw new Error("Unsupported protocol")
	}
	if (!order.signature) {
		throw new Error("Signature should exists")
	}
	if (order.start === undefined || order.end === undefined) {
		throw new Error("Order should includes start/end fields")
	}

	return {
		parameters: {
			counter: order.data.counter,
			offerer: order.maker,
			zone: order.data.zone,
			orderType: convertOrderType(order.data.orderType),
			startTime: order.start.toString(),
			endTime: order.end.toString(),
			zoneHash: order.data.zoneHash,
			salt: order.salt,
			offer: order.data.offer.map(offerItem => ({
				itemType: convertItemType(offerItem.itemType),
				token: offerItem.token,
				identifierOrCriteria: offerItem.identifierOrCriteria,
				startAmount: offerItem.startAmount,
				endAmount: offerItem.endAmount,
			})),
			consideration: order.data.consideration.map(item => ({
				itemType: convertItemType(item.itemType),
				token: item.token,
				identifierOrCriteria: item.identifierOrCriteria,
				startAmount: item.startAmount,
				endAmount: item.endAmount,
				recipient: item.recipient,
			})),
			totalOriginalConsiderationItems: order.data.consideration.length,
			conduitKey: order.data.conduitKey,
		},
		signature: order.signature,
	}
}
