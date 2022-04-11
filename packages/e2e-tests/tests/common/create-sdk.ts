import { Blockchain } from "@rarible/api-client"
import type { IRaribleSdk } from "@rarible/sdk"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RaribleSdkEnvironment } from "@rarible/sdk/src/config/domain"
import { createRaribleSdk } from "@rarible/sdk"
import { LogsLevel } from "@rarible/sdk/build/domain"
import { testsConfig } from "./config"

export function createSdk(blockchain: Blockchain, wallet: BlockchainWallet): IRaribleSdk {
	let env: RaribleSdkEnvironment = testsConfig.env as RaribleSdkEnvironment

	switch (blockchain) {
		case Blockchain.POLYGON:
			env = "dev"
			break
		default:
	}

	return createRaribleSdk(wallet, env, { logs: LogsLevel.DISABLED })
}
