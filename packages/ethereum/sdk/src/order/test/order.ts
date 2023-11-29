import { toAddress, toBigNumber, toWord } from "@rarible/types"
import { Blockchain } from "@rarible/api-client/build/models/Blockchain"
import type { OrderForm } from "@rarible/api-client"
import { getEthUnionAddr } from "../../common/test"

export const TEST_ORDER_TEMPLATE: Omit<OrderForm, "signature" | "data"> = {
	"@type": "RARIBLE_V2",
	make: {
		assetType: {
			"@type": "ERC721",
			contract: toAddress("0x0000000000000000000000000000000000000001"),
			tokenId: toBigNumber("10"),
		},
		value: toBigNumber("10"),
	},
	maker: getEthUnionAddr("0x0000000000000000000000000000000000000002"),
	take: {
		assetType: {
			"@type": "ERC721",
			contract: toAddress("0x0000000000000000000000000000000000000001"),
			tokenId: toBigNumber("10"),
		},
		value: toBigNumber("10"),
	},
	salt: toWord("0x000000000000000000000000000000000000000000000000000000000000000a"),
	blockchain: Blockchain.ETHEREUM,
	endedAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
}
