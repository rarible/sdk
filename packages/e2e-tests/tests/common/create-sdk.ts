import { Blockchain, BlockchainGroup } from "@rarible/api-client"
import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RaribleSdkEnvironment } from "@rarible/sdk/src/config/domain"
import { createRaribleSdk } from "@rarible/sdk"
import { LogsLevel } from "@rarible/sdk/build/domain"
import type { AuthWithPrivateKey } from "@rarible/flow-sdk/build/types"
import { testsConfig } from "./config"

export function createSdk(blockchain: Blockchain, wallet: BlockchainWallet): IRaribleSdk {
	let env: RaribleSdkEnvironment = testsConfig.env as RaribleSdkEnvironment
	let flowAuth: AuthWithPrivateKey = undefined
	switch (blockchain) {
		case Blockchain.POLYGON:
			env = "dev"
			break
		case Blockchain.FLOW:
			env = "dev"
			flowAuth = wallet.blockchain === BlockchainGroup.FLOW ? wallet.getAuth() : undefined
			break
		default:
	}

	return createRaribleSdk(
		wallet,
		env,
		{
			logs: LogsLevel.DISABLED,
			...flowAuth ? {
				flow: {
					auth: flowAuth,
				},
			} : {},
		},
	)
}
