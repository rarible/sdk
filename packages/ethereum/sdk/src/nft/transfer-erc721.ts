import type { Address } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import { createErc721Contract } from "../order/contracts/erc721"
import type { SendFunction } from "../common/send-transaction"

export async function transferErc721(
	ethereum: Ethereum,
	send: SendFunction,
	contract: Address,
	from: Address,
	to: Address,
	tokenId: string
): Promise<EthereumTransaction> {
	const erc721 = createErc721Contract(ethereum, contract)
	return send(erc721.functionCall("safeTransferFrom", from, to, tokenId))
}
