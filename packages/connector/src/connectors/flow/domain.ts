import type { Fcl } from "@rarible/fcl-types"
import type { ProviderConnectionResult, Blockchain } from "../../common/provider-wallet"

export interface FlowProviderConnectionResult extends ProviderConnectionResult {
	blockchain: Blockchain.FLOW
	fcl: Fcl
}