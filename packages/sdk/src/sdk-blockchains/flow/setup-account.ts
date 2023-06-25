import type { FlowSdk } from "@rarible/flow-sdk"
import type { CollectionId } from "@rarible/api-client"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { FlowNetwork } from "@rarible/flow-sdk/build/types"
import type { CollectionsInitStatus } from "@rarible/flow-sdk/build/collection/check-init-mattel-collections"
import { getFlowCollection } from "./common/converters"

export class FlowSetupAccount {
	constructor(
		private readonly sdk: FlowSdk,
		private network: FlowNetwork,
	) {
		this.setupAccount = this.setupAccount.bind(this)
		this.checkInitMattelCollections = this.checkInitMattelCollections.bind(this)
		this.setupMattelCollections = this.setupMattelCollections.bind(this)
	}

	async setupAccount(collection: CollectionId) {
		const flowCollection = getFlowCollection(collection)
		const tx = await this.sdk.collection.setupAccount(flowCollection)
		return new BlockchainFlowTransaction(tx, this.network)
	}

	async checkInitMattelCollections() {
		const statuses = await this.sdk.collection.checkInitMattelCollections()
		const initCollections = Object.keys(statuses)
			.every(key => statuses[key as keyof CollectionsInitStatus])
		return {
			initCollections,
			collections: statuses,
		}
	}

	async setupMattelCollections() {
		const tx = await this.sdk.collection.setupMattelCollections()
		return new BlockchainFlowTransaction(tx, this.network)
	}
}
