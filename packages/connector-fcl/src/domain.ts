import type { Fcl } from "@rarible/fcl-types"
import type { ProviderConnectionResult } from "@rarible/connector/src/common/provider-wallet"

export interface FlowProviderConnectionResult extends ProviderConnectionResult {
	fcl: Fcl
}