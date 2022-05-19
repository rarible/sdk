import type { TezosNetwork } from "@rarible/tezos-sdk"
import type { OperationResult } from "@rarible/tezos-sdk"
import { BlockchainTezosTransaction } from "./index"

const networks: TezosNetwork[] = ["mainnet", "testnet"]

describe.each(networks)("get flow tx link in %s network", network => {
	test("get tx link", () => {
		const tx = new BlockchainTezosTransaction({
			hash: "ooCzZbUZGqUhXkiQ378MxWv8jvee3MJofnK2DigTc2azkBtoGif",
		} as OperationResult, network)

		tx.getTxLink()
	})
})
