import { createTestAuth, FLOW_TEST_ACCOUNT_1, FLOW_TEST_ACCOUNT_2 } from "@rarible/flow-test-common"
import { Fcl } from "@rarible/fcl-types"

export function createTestFlowAuth(fcl: Fcl) {
	const authUser1 = createTestAuth(fcl, FLOW_TEST_ACCOUNT_1.address, FLOW_TEST_ACCOUNT_1.privKey)
	const authUser2 = createTestAuth(fcl, FLOW_TEST_ACCOUNT_2.address, FLOW_TEST_ACCOUNT_2.privKey)

	return { authUser1, authUser2 }
}
