import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { toUnionAddress } from "@rarible/types"
import { getWallet } from "../common/test/test-wallets"
import { createSdk } from "../common/test/create-sdk"

describe("Solana bidding balance", () => {
	const wallet = getWallet(0)
	const it = awaitAll({
		sdk: createSdk(wallet),
	})

	test("Should check bidding balance", async () => {
		const balance = await it.sdk.balances.getBiddingBalance({
			currency: {
				"@type": "SOLANA_SOL",
			},
			walletAddress: toUnionAddress("SOLANA:" + wallet.publicKey.toString()),
		})

		expect(parseFloat(balance!.toString())).toBeGreaterThanOrEqual(0.00089088)
	})

	test("Should deposit bidding balance", async () => {
		const tx = await it.sdk.balances.depositBiddingBalance({
			currency: {
				"@type": "SOLANA_SOL",
			},
			amount: 0.01,
		})

		await tx!.wait()
		expect(tx!.hash()).toBeTruthy()
	})

	test("Should withdraw bidding balance", async () => {
		const tx = await it.sdk.balances.withdrawBiddingBalance({
			currency: {
				"@type": "SOLANA_SOL",
			},
			amount: 0.01,
		})

		await tx!.wait()
		expect(tx!.hash()).toBeTruthy()
	})
})
