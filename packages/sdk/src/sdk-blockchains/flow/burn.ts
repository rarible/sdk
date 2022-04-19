import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { FlowSdk } from "@rarible/flow-sdk"
import type { FlowNetwork } from "@rarible/flow-sdk/build/types"
import type { BurnRequest, PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import { parseFlowItemIdFromUnionItemId } from "./common/converters"

export class FlowBurn {
	constructor(
		private sdk: FlowSdk,
		private network: FlowNetwork,
	) {
		this.burn = this.burn.bind(this)
	}

	async burn(prepare: PrepareBurnRequest): Promise<PrepareBurnResponse> {
		if (!prepare.itemId) {
			throw new Error("ItemId has not been specified")
		}
		const {
			itemId,
			contract,
		} = parseFlowItemIdFromUnionItemId(prepare.itemId)

		return {
			multiple: false,
			maxAmount: toBigNumber("1"),
			submit: Action.create({
				id: "burn" as const,
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				run: async (request: BurnRequest) => {
					// @todo itemId number must be string
					const tx = await this.sdk.nft.burn(contract, parseInt(itemId))
					return new BlockchainFlowTransaction(tx, this.network)
				},
			}),
		}
	}
}
