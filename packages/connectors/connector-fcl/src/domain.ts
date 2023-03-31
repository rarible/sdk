import type { Fcl } from "@rarible/fcl-types"
import type { ProviderConnectionResult } from "@rarible/connector"

export interface FlowProviderConnectionResult extends ProviderConnectionResult {
	fcl: Fcl
}