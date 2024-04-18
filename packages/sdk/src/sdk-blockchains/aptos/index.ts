import { AptosSdk } from "@rarible/aptos-sdk/src"
import type { AptosWallet } from "@rarible/aptos-wallet"
import type { AptosSdkEnv } from "@rarible/aptos-sdk/src/domain"
import type { AptosSdkConfig } from "@rarible/aptos-sdk/src/domain"

export function createAptosSdk(
	wallet: AptosWallet,
	env: AptosSdkEnv,
	config?: AptosSdkConfig,
) {
	const sdk = new AptosSdk(wallet, env, config)

	return {
		nft: {

		},
		order: {

		},
		balances: {

		},
		restriction: {

		},
	}
}
