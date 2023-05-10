import { toUnionAddress } from "@rarible/types"
import { getWallet } from "../common/test/test-wallets"
import { createSdk } from "../common/test/create-sdk"

describe("Solana bidding balance", () => {
	const wallet = getWallet(0)
	const sdk = createSdk(wallet)

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
