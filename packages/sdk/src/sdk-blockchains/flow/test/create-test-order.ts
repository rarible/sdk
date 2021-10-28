import { Order } from "@rarible/api-client"
import { toBigNumber, toOrderId, toUnionAddress } from "@rarible/types"

export function createTestOrder(orderId: string): Order {
	return {
		id: toOrderId(`FLOW:${orderId}`),
		fill: toBigNumber("0"),
		platform: "RARIBLE",
		makeStock: toBigNumber("1"),
		cancelled: true,
		createdAt: "2021-10-26T18:21:01.612Z",
		lastUpdatedAt: "2021-10-26T18:20:52.255Z",
		makePrice: toBigNumber("1.025"),
		priceHistory: [],
		maker: toUnionAddress("FLOW:0x285b7909b8ed1652"),
		make: {
			type: {
				"@type": "FLOW_NFT",
				contract: toUnionAddress("FLOW:A.01658d9b94068f3c.CommonNFT"),
				tokenId: toBigNumber("617"),
			},
			value: toBigNumber("1"),
		},
		take: {
			type: {
				"@type": "FLOW_FT",
				contract: toUnionAddress("FLOW:A.7e60df042a9c0868.FlowToken"),
			},
			value: toBigNumber("1.025"),
		},
		salt: "",
		pending: [],
		data: { "@type": "FLOW_RARIBLE_V1", payouts: [], originFees: [] },
	}
}
