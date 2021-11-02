import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Provider } from "tezos-sdk-module/dist/common/base"
import { Action } from "@rarible/action"
import { PrepareOrderRequest, PrepareOrderResponse } from "../../order/common"
import { getTezosItemData } from "./common"

export class Bid {
	constructor(private provider: Provider) {
		this.bid = this.bid.bind(this)
	}

	async bid(prepare: PrepareOrderRequest): Promise<PrepareOrderResponse> {
		const { itemId } = getTezosItemData(prepare.itemId)

		// const item = await this.sdk.apis.nftItem.getNftItemById({ itemId })
		// const collection = await this.sdk

		return {
			submit: Action.create({
				id: "send-tx" as const,
				run: async () => {

				},
			}),
		}
	}
}
