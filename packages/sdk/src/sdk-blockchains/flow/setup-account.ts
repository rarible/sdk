import type { FlowSdk } from "@rarible/flow-sdk"
import type { CollectionId } from "@rarible/api-client"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { FlowNetwork } from "@rarible/flow-sdk/build/types"
import { getFlowCollection } from "./common/converters"

export class FlowSetupAccount {
	constructor(
		private readonly sdk: FlowSdk,
		private network: FlowNetwork,
	) {
		this.setupAccount = this.setupAccount.bind(this)
	}

	async setupAccount(collection: CollectionId) {
		const flowCollection = getFlowCollection(collection)
		const tx = await this.sdk.collection.setupAccount(flowCollection)
		return new BlockchainFlowTransaction(tx, this.network)
	}
}
