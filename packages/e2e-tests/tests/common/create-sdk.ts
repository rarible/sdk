import { Blockchain } from "@rarible/api-client"
import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RaribleSdkEnvironment } from "@rarible/sdk/src/config/domain"
import { createRaribleSdk } from "@rarible/sdk"
import { LogsLevel } from "@rarible/sdk/build/domain"

export function createSdk(blockchain: Blockchain, wallet: BlockchainWallet): IRaribleSdk {
	let env: RaribleSdkEnvironment = "e2e"

	switch (blockchain) {
		case Blockchain.TEZOS:
			env = "dev" // @todo: tezos not working in e2e, need to fix (?)
			break
		case Blockchain.POLYGON:
			env = "dev"
			break
		default:
	}

	return createRaribleSdk(wallet, env, { logs: LogsLevel.DISABLED })
}
