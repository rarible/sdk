import type { Ethereum } from "@rarible/ethereum-provider"
import { toAddress } from "@rarible/types"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import { toBn } from "@rarible/utils"
import type { Address } from "@rarible/ethereum-api-client"
import { createErc20Contract } from "../../contracts/erc20"
import { createErc721Contract } from "../../contracts/erc721"
import type { SendFunction } from "../../../common/send-transaction"
import { createErc1155Contract } from "../../contracts/erc1155"
import { waitTx } from "../../../common/wait-tx"
import type { InsufficientApprovals } from "./balance-and-approval-check"
import type { Item } from "./types"
import { isErc1155Item, isErc721Item } from "./item"
import { ItemType, MAX_INT } from "./constants"

export const approvedItemAmount = async (
	ethereum: Ethereum,
	owner: string,
	item: Item,
	operator: string,
) => {
	if (isErc721Item(item.itemType) || isErc1155Item(item.itemType)) {
		const erc721 = createErc721Contract(ethereum, toAddress(item.token))
		const allowance: boolean = await erc721.functionCall("isApprovedForAll", owner, operator).call()
		return allowance ? MAX_INT : toBn(0)

	} else if (item.itemType === ItemType.ERC20) {

		const erc20 = createErc20Contract(ethereum, toAddress(item.token))
		return await erc20.functionCall("allowance", owner, operator).call()

	}

	// We don't need to check approvals for native tokens
	return MAX_INT
}

/**
 * Get approval actions given a list of insufficent approvals.
 */
export function getApprovalActions(
	ethereum: Ethereum,
	send: SendFunction,
	insufficientApprovals: InsufficientApprovals,
	wrapperAddress?: Address
): Promise<EthereumTransaction[]> {
	return Promise.all(
		insufficientApprovals
			.filter(
				(approval, index) =>
					index === insufficientApprovals.length - 1 ||
          insufficientApprovals[index + 1].token !== approval.token
			)
			.map(async ({ token, operator, itemType }) => {
				if (isErc721Item(itemType)) {
					const erc721 = createErc721Contract(ethereum, toAddress(token))
					return send(erc721.functionCall("setApprovalForAll", operator, true))
				} else if (isErc1155Item(itemType)) {
					const erc1155 = createErc1155Contract(ethereum, toAddress(token))
					return send(erc1155.functionCall("setApprovalForAll", operator, true))
				} else {
					const erc20 = createErc20Contract(ethereum, toAddress(token))
					return send(erc20.functionCall("approve", wrapperAddress ?? operator, MAX_INT.toFixed()))
				}
			})
			.map(async tx => {
				await waitTx(tx)
				return tx
			})
	)
}
