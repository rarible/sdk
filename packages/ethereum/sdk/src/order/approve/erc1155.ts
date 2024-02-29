import type { Address } from "@rarible/ethereum-api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "../../../ethereum-provider"
import type { SendFunction } from "../common/send-transaction"
import { createErc1155Contract } from "./contracts/erc1155"

export async function approveErc1155(
	ethereum: Maybe<Ethereum>,
	send: SendFunction,
	contract: Address,
	owner: Address,
	operator: Address
): Promise<EthereumTransaction | undefined> {
	if (!ethereum) {
		throw new Error("Wallet undefined")
	}
	const erc1155 = createErc1155Contract(ethereum, contract)
	let allowance: boolean
	try {
		allowance = await erc1155.functionCall("isApprovedForAll", owner, operator).call()
	} catch (e) {
		allowance = false
	}
	if (!allowance) {
		return send(erc1155.functionCall("setApprovalForAll", operator, true))
	}
	return undefined
}
