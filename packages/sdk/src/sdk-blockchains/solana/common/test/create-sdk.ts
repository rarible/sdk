import { SolanaWallet } from "@rarible/sdk-wallet"
import type { SolanaWalletProvider } from "@rarible/solana-wallet"
import { BlockchainGroup } from "@rarible/api-client"
import { createRaribleSdk } from "../../../../index"
import type { IRaribleSdk } from "../../../../index"
import { LogsLevel } from "../../../../domain"

export function createSdk(wallet: SolanaWalletProvider): IRaribleSdk {
	const endpoint = process.env.SOLANA_CUSTOM_ENDPOINT !== "" ? process.env.SOLANA_CUSTOM_ENDPOINT : undefined
	console.debug("solana endpoint:", endpoint)

	return createRaribleSdk(new SolanaWallet(wallet), "development", {
		logs: LogsLevel.DISABLED,
		blockchain: {
			[BlockchainGroup.SOLANA]: {
				endpoint: endpoint,
			},
		},
	})
}
