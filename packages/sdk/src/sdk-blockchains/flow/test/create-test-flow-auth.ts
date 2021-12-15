import { createTestAuth, FLOW_TESTNET_ACCOUNT_1, FLOW_TESTNET_ACCOUNT_2 } from "@rarible/flow-test-common"
import type { Fcl } from "@rarible/fcl-types"

export function createTestFlowAuth(fcl: Fcl) {
	return {
		authUser1: createTestAuth(fcl, "testnet", FLOW_TESTNET_ACCOUNT_1.address, FLOW_TESTNET_ACCOUNT_1.privKey),
		authUser2: createTestAuth(fcl, "testnet", FLOW_TESTNET_ACCOUNT_2.address, FLOW_TESTNET_ACCOUNT_2.privKey),
	}
}
