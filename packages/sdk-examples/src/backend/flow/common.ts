import { FlowWallet } from "@rarible/sdk-wallet"
import * as fcl from "@onflow/fcl"
import { createFlowAuth } from "@rarible/flow-test-common"

export function initFlowWallet(accountAddress: string, privateKey: string) {
	const flowAuth = createFlowAuth(fcl, "testnet", accountAddress, privateKey)
	return new FlowWallet(fcl, flowAuth)
}
