import { toAddress, toBigNumber, toWord } from "@rarible/types"
import type { SimpleOrder } from "../types"

export const TEST_ORDER_TEMPLATE: Omit<SimpleOrder, "type" | "data"> = {
	make: {
		assetType: {
			assetClass: "ERC721",
			contract: toAddress("0x0000000000000000000000000000000000000001"),
			tokenId: toBigNumber("10"),
		},
		value: toBigNumber("10"),
	},
	maker: toAddress("0x0000000000000000000000000000000000000002"),
	take: {
		assetType: {
			assetClass: "ERC721",
			contract: toAddress("0x0000000000000000000000000000000000000001"),
			tokenId: toBigNumber("10"),
		},
		value: toBigNumber("10"),
	},
	salt: toWord("0x000000000000000000000000000000000000000000000000000000000000000a"),
}
