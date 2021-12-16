import type { FlowNetwork } from "@rarible/flow-sdk/build/types"
import type { FlowTransaction } from "@rarible/flow-sdk/build/types"
import { BlockchainFlowTransaction } from "./"

const networks: FlowNetwork[] = ["mainnet", "testnet", "emulator"]

describe.each(networks)("get flow tx link in %s network", network => {
	test("get tx link", () => {
		const tx = new BlockchainFlowTransaction({
			txId: "1721f23ffbca59e5a48e330cdafa0e5c7f709141ee796d47fdf37a85d630a69c",
		} as FlowTransaction, network)

		tx.getTxLink()
	})
})
