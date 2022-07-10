import type { Order } from "@rarible/api-client"
import { toBigNumber, toOrderId } from "@rarible/types"
import { Blockchain, OrderStatus, Platform } from "@rarible/api-client"
import { convertFlowContractAddress, convertFlowUnionAddress } from "../common/converters"

export function createTestOrder(orderId: string): Order {
	return {
		id: toOrderId(`${Blockchain.FLOW}:${orderId}`),
		fill: toBigNumber("0"),
		platform: Platform.RARIBLE,
		makeStock: toBigNumber("1"),
		cancelled: true,
		createdAt: "2021-10-26T18:21:01.612Z",
		lastUpdatedAt: "2021-10-26T18:20:52.255Z",
		makePrice: toBigNumber("1.025"),
		maker: convertFlowUnionAddress("0x285b7909b8ed1652"),
		make: {
			type: {
				"@type": "FLOW_NFT",
				contract: convertFlowContractAddress("A.ebf4ae01d1284af8.RaribleNFT"),
				tokenId: toBigNumber("617"),
			},
			value: toBigNumber("1"),
		},
		take: {
			type: {
				"@type": "FLOW_FT",
				contract: convertFlowContractAddress("A.7e60df042a9c0868.FlowToken"),
			},
			value: toBigNumber("1.025"),
		},
		salt: "",
		pending: [],
		status: OrderStatus.ACTIVE,
		data: {
			"@type": "FLOW_RARIBLE_V1",
			payouts: [],
			originFees: [],
		},
	}
}
