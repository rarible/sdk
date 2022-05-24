import { SolanaWallet } from "@rarible/sdk-wallet"
import { toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"

describe("Solana AuctionHouse escrow", () => {
	const wallet = getWallet(0)
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "development", { logs: LogsLevel.DISABLED })

	test("Should check escrow balance", async () => {
		const balance = await sdk.solana?.getEscrowBalance?.({
			currency: {
				"@type": "SOLANA_SOL",
			},
			address: toUnionAddress("SOLANA:" + wallet.publicKey.toString()),
		})

		expect(parseFloat(balance!.toString())).toBeGreaterThanOrEqual(0.00089088)
	})

	test("Should deposit escrow balance", async () => {
		const tx = await sdk.solana?.depositEscrow?.({
			currency: {
				"@type": "SOLANA_SOL",
			},
			amount: 0.01,
		})

		await tx!.wait()
		expect(tx!.hash()).toBeTruthy()
	})

	test("Should withdraw escrow balance", async () => {
		const tx = await sdk.solana?.withdrawEscrow?.({
			currency: {
				"@type": "SOLANA_SOL",
			},
			amount: 0.01,
		})

		await tx!.wait()
		expect(tx!.hash()).toBeTruthy()
	})
})
