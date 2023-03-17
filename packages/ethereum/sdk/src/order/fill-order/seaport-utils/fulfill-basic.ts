import type { Ethereum } from "@rarible/ethereum-provider"
import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import type { EthereumContract } from "@rarible/ethereum-provider"
import type { OrderFillSendData } from "../types"
import { createSeaportV14Contract } from "../../contracts/seaport-v14"
import type { BasicOrderParametersStruct, ConsiderationItem, Order } from "./types"
import { getSummedTokenAndIdentifierAmounts } from "./item"
import type { TimeBasedItemParams } from "./item"
import {
	BasicOrderRouteType,
	CROSS_CHAIN_SEAPORT_V1_4_ADDRESS,
	ItemType,
	NO_CONDUIT,
} from "./constants"

export async function getfulfillBasicOrderData({
	ethereum,
	order,
	timeBasedItemParams,
	tips = [],
	conduitKey = NO_CONDUIT,
	seaportContract,
}: {
	ethereum: Ethereum,
	order: Order;
	timeBasedItemParams: TimeBasedItemParams;
	tips?: ConsiderationItem[];
	conduitKey: string;
	seaportContract: EthereumContract
}): Promise<OrderFillSendData> {
	const { offer, consideration } = order.parameters
	const considerationIncludingTips = [...consideration, ...tips]

	const offerItem = offer[0]
	const [forOfferer, ...forAdditionalRecipients] = considerationIncludingTips

	const basicOrderRouteType =
    offerAndConsiderationFulfillmentMapping[offerItem.itemType]?.[
    	forOfferer.itemType
    ]

	if (basicOrderRouteType === undefined) {
		throw new Error(
			"Order parameters did not result in a valid basic fulfillment"
		)
	}

	const additionalRecipients = forAdditionalRecipients.map(
		({ startAmount, recipient }) => ({
			amount: startAmount,
			recipient,
		})
	)

	const considerationWithoutOfferItemType = considerationIncludingTips.filter(
		(item) => item.itemType !== offer[0].itemType
	)

	const totalNativeAmount = getSummedTokenAndIdentifierAmounts({
		items: considerationWithoutOfferItemType,
		criterias: [],
		timeBasedItemParams: {
			...timeBasedItemParams,
			isConsiderationItem: true,
		},
	})[ZERO_ADDRESS]?.["0"]

	const basicOrderParameters: BasicOrderParametersStruct = {
		offerer: order.parameters.offerer,
		offererConduitKey: order.parameters.conduitKey,
		zone: order.parameters.zone,
		basicOrderType: order.parameters.orderType + 4 * basicOrderRouteType,
		offerToken: offerItem.token,
		offerIdentifier: offerItem.identifierOrCriteria,
		offerAmount: offerItem.endAmount,
		considerationToken: forOfferer.token,
		considerationIdentifier: forOfferer.identifierOrCriteria,
		considerationAmount: forOfferer.endAmount,
		startTime: order.parameters.startTime,
		endTime: order.parameters.endTime,
		salt: order.parameters.salt,
		totalOriginalAdditionalRecipients:
      order.parameters.consideration.length - 1,
		signature: order.signature,
		fulfillerConduitKey: conduitKey,
		additionalRecipients,
		zoneHash: order.parameters.zoneHash,
	}

	// const seaportContract = createSeaportV14Contract(ethereum, toAddress(CROSS_CHAIN_SEAPORT_V1_4_ADDRESS))
	const functionCall = seaportContract.functionCall("fulfillBasicOrder", basicOrderParameters)

	console.log("fulfillBasicOrder", JSON.stringify(basicOrderParameters, null, " "))

	return {
		functionCall,
		options: { value: totalNativeAmount?.toString() },
	}
}

const offerAndConsiderationFulfillmentMapping: {
	[_key in ItemType]?: { [_key in ItemType]?: BasicOrderRouteType };
} = {
	[ItemType.ERC20]: {
		[ItemType.ERC721]: BasicOrderRouteType.ERC721_TO_ERC20,
		[ItemType.ERC1155]: BasicOrderRouteType.ERC1155_TO_ERC20,
	},
	[ItemType.ERC721]: {
		[ItemType.NATIVE]: BasicOrderRouteType.ETH_TO_ERC721,
		[ItemType.ERC20]: BasicOrderRouteType.ERC20_TO_ERC721,
	},
	[ItemType.ERC1155]: {
		[ItemType.NATIVE]: BasicOrderRouteType.ETH_TO_ERC1155,
		[ItemType.ERC20]: BasicOrderRouteType.ERC20_TO_ERC1155,
	},
} as const
