import { SolanaWallet } from "@rarible/sdk-wallet"
import { toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"

describe("Solana bidding balance", () => {
	const wallet = getWallet(0)
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "development", { logs: LogsLevel.DISABLED })

	test("Should check bidding balance", async () => {
		const balance = await sdk.balances.getBiddingBalance({
			currency: {
				"@type": "SOLANA_SOL",
			},
			walletAddress: toUnionAddress("SOLANA:" + wallet.publicKey.toString()),
		})

		expect(parseFloat(balance!.toString())).toBeGreaterThanOrEqual(0.00089088)
	})

	test("Should deposit bidding balance", async () => {
		const tx = await sdk.balances.depositBiddingBalance({
			currency: {
				"@type": "SOLANA_SOL",
			},
			amount: 0.01,
		})

		await tx!.wait()
		expect(tx!.hash()).toBeTruthy()
	})

	test("Should withdraw bidding balance", async () => {
		const tx = await sdk.balances.withdrawBiddingBalance({
			currency: {
				"@type": "SOLANA_SOL",
			},
			amount: 0.01,
		})

		await tx!.wait()
		expect(tx!.hash()).toBeTruthy()
	})
})
