import type { Blockchain } from "@rarible/api-client"
import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RaribleSdkEnvironment } from "@rarible/sdk/src/config/domain"
import { createRaribleSdk } from "@rarible/sdk"

export function createSdk(blockchain: Blockchain, wallet: BlockchainWallet): IRaribleSdk {
	let env: RaribleSdkEnvironment = "e2e"

	switch (blockchain) {
		case "TEZOS":
			env = "dev" // @todo: tezos not working in e2e, need to fix (?)
			break
		default:
	}

	return createRaribleSdk(wallet, env, {})
}
