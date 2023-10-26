import type { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import type { CollectionId } from "@rarible/api-client"
import type { CollectionsInitStatus } from "@rarible/flow-sdk/build/collection/check-init-mattel-collections"
import type { UnionAddress } from "@rarible/types"

export type IFlowSetupAccount = (collectionId: CollectionId) => Promise<BlockchainFlowTransaction>
export type IFlowCheckInitMattelCollections =
  (address?: UnionAddress) => Promise<{initCollections: boolean, collections: CollectionsInitStatus}>
export type IFlowSetupMattelCollections = () => Promise<BlockchainFlowTransaction>
