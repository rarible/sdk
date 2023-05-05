import type { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { CollectionId } from "@rarible/api-client"

export type IFlowSetupAccount = (collectionId: CollectionId) => Promise<BlockchainFlowTransaction>
