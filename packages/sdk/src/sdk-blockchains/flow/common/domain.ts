import type { Blockchain } from "@rarible/api-client"
import type { FlowContractAddress } from "@rarible/types"

export type ParsedFlowItemIdFromUnionItemId = { blockchain: Blockchain, contract: FlowContractAddress, itemId: string }
