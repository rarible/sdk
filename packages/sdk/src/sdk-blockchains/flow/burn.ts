import { Action } from "@rarible/action"
import { toBigNumber } from "@rarible/types"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import { FlowSdk } from "@rarible/flow-sdk"
import { BurnRequest, PrepareBurnRequest } from "../../types/nft/burn/domain"
import { parseUnionItemId } from "./common/converters"

export class FlowBurn {
	constructor(
		private sdk: FlowSdk,
	) {
		this.burn = this.burn.bind(this)
	}

	async burn(prepare: PrepareBurnRequest) {
		if (!prepare.itemId) {
			throw new Error("ItemId has not been specified")
		}
		const { itemId, collectionId } = parseUnionItemId(prepare.itemId)

		return {
			multiple: false,
			maxAmount: toBigNumber("1"),
			submit: Action.create({
				id: "burn" as const,
				run: async (request: BurnRequest) => {

					const tx = await this.sdk.nft.burn(collectionId, parseInt(itemId))

					return new BlockchainFlowTransaction(tx)
				},
			}),
		}
	}
}
