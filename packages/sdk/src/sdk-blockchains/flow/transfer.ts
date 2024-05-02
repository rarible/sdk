import { Action } from "@rarible/action"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { FlowSdk } from "@rarible/flow-sdk"
import { toBigNumber } from "@rarible/types/build/big-number"
import type { FlowNetwork } from "@rarible/flow-sdk"
import type { PrepareTransferRequest, TransferRequest } from "../../types/nft/transfer/domain"
import type { TransferSimplifiedRequest } from "../../types/nft/transfer/simplified"
import { parseFlowAddressFromUnionAddress, parseFlowItemIdFromUnionItemId } from "./common/converters"

export class FlowTransfer {
	constructor(
		private sdk: FlowSdk,
		private network: FlowNetwork,
	) {
		this.transfer = this.transfer.bind(this)
		this.transferBasic = this.transferBasic.bind(this)
	}

	async transfer(prepare: PrepareTransferRequest) {
		const {
			itemId,
			contract,
		} = parseFlowItemIdFromUnionItemId(prepare.itemId)

		return {
			multiple: false,
			maxAmount: toBigNumber("1"),
			submit: Action.create({
				id: "transfer" as const,
				run: async (request: Omit<TransferRequest, "amount">) => {
					const toAddress = parseFlowAddressFromUnionAddress(request.to)
					// @todo remove parseInt when strings are supports by flow-sdk
					const tx = await this.sdk.nft.transfer(contract, parseInt(itemId), toAddress)
					return new BlockchainFlowTransaction(tx, this.network)
				},
			}),
		}
	}

	async transferBasic(request: TransferSimplifiedRequest): Promise<IBlockchainTransaction> {
		const response = await this.transfer(request)
		return response.submit(request)
	}

}
