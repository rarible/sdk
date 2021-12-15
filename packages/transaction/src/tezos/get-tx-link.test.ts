import type { TezosNetwork } from "tezos-sdk-module"
import type { OperationResult } from "tezos-sdk-module/dist/common/base"
import { BlockchainTezosTransaction } from "./index"

const networks: TezosNetwork[] = ["mainnet", "hangzhou"]

describe.each(networks)("get flow tx link in %s network", network => {
	test("get tx link", () => {
		const tx = new BlockchainTezosTransaction({
			hash: "ooCzZbUZGqUhXkiQ378MxWv8jvee3MJofnK2DigTc2azkBtoGif",
		} as OperationResult, network)

		tx.getTxLink()
	})
})
