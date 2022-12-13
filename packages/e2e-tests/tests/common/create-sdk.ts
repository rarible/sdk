import { Blockchain } from "@rarible/api-client"
import type { IRaribleSdk } from "@rarible/sdk/node"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RaribleSdkEnvironment } from "@rarible/sdk/src/config/domain"
import { createRaribleSdk } from "@rarible/sdk/node"
import { LogsLevel } from "@rarible/sdk/node/domain"
import type { AuthWithPrivateKey } from "@rarible/flow-sdk/build/types"
import { WalletType } from "@rarible/sdk-wallet"
import { testsConfig } from "./config"

export async function createSdk(blockchain: Blockchain, wallet: BlockchainWallet): Promise<IRaribleSdk> {
	let env: RaribleSdkEnvironment = testsConfig.env as RaribleSdkEnvironment
	let flowAuth: AuthWithPrivateKey = undefined
	switch (blockchain) {
		case Blockchain.FLOW:
			env = "development"
			flowAuth = wallet.walletType === WalletType.FLOW ? wallet.getAuth() : undefined
			break
		case Blockchain.TEZOS:
			env = "testnet"
			break
		default:
			break
	}

	return await createRaribleSdk(
		wallet,
		env,
		{
			logs: LogsLevel.DISABLED,
			...(flowAuth ? {
				blockchain: {
					[WalletType.FLOW]: {
						auth: flowAuth,
					},
				},
			} : {}),
		},
	)
}
