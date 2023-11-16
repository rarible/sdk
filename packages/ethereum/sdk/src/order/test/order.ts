import { toAddress, toBigNumber, toWord } from "@rarible/types"
import type { SimpleOrder } from "../types"
import { getEthUnionAddr } from "../../common/test"

export const TEST_ORDER_TEMPLATE: Omit<SimpleOrder, "type" | "data"> = {
	make: {
		type: {
			"@type": "ERC721",
			contract: toAddress("0x0000000000000000000000000000000000000001"),
			tokenId: toBigNumber("10"),
		},
		value: toBigNumber("10"),
	},
	maker: getEthUnionAddr("0x0000000000000000000000000000000000000002"),
	take: {
		type: {
			"@type": "ERC721",
			contract: toAddress("0x0000000000000000000000000000000000000001"),
			tokenId: toBigNumber("10"),
		},
		value: toBigNumber("10"),
	},
	salt: toWord("0x000000000000000000000000000000000000000000000000000000000000000a"),
}
