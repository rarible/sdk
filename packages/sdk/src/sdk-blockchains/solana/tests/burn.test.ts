import { toCurrencyId, toUnionAddress } from "@rarible/types"
import { SolanaWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"

describe("Solana burn", () => {
	const wallet = getWallet()
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "development", { logs: LogsLevel.DISABLED })

	test("Should burn NFT", async () => {
		const item = await mintToken(sdk)
		const itemId = item.id

		let balance = await retry(10, 4000, async () => {
			const balance = await sdk.balances.getBalance(
				toUnionAddress("SOLANA:" + wallet.publicKey),
				{ "@type": "SOLANA_NFT", itemId },
			)
			if (parseFloat(balance.toString()) < 1) {
				throw new Error(`Wrong balance value. Expected ${1}. Actual: ${parseFloat(balance.toString())}`)
			}
			return balance
		})
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)

		const tx = await retry(10, 4000, async () => {
			const burn = await sdk.nft.burn({ itemId })
			return burn.submit({ amount: parseFloat(balance.toString()) })
		})
		await tx?.wait()

		balance = await retry(10, 4000, async () => {
			const balance = await sdk.balances.getBalance(
				toUnionAddress("SOLANA:" + wallet.publicKey),
				toCurrencyId(itemId),
			)
			if (parseFloat(balance.toString()) !== 0) {
				throw new Error(`Wrong balance value. Expected ${0}. Actual: ${parseFloat(balance.toString())}`)
			}
			return balance
		})
		expect(parseFloat(balance.toString())).toEqual(0)
	})

	test("Should burn NFT with basic function", async () => {
		const item = await mintToken(sdk)
		const itemId = item.id

		let balance = await retry(10, 4000, async () => {
			const balance = await sdk.balances.getBalance(
				toUnionAddress("SOLANA:" + wallet.publicKey),
				{ "@type": "SOLANA_NFT", itemId },
			)
			if (parseFloat(balance.toString()) < 1) {
				throw new Error(`Wrong balance value. Expected ${1}. Actual: ${parseFloat(balance.toString())}`)
			}
			return balance
		})
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)

		const tx = await retry(10, 4000, async () => {
			return sdk.nftBasic.burn({
				itemId,
				amount: parseFloat(balance.toString()),
			})
		})
		await tx?.wait()

		balance = await retry(10, 4000, async () => {
			const balance = await sdk.balances.getBalance(
				toUnionAddress("SOLANA:" + wallet.publicKey),
				toCurrencyId(itemId),
			)
			if (parseFloat(balance.toString()) !== 0) {
				throw new Error(`Wrong balance value. Expected ${0}. Actual: ${parseFloat(balance.toString())}`)
			}
			return balance
		})
		expect(parseFloat(balance.toString())).toEqual(0)
	})
})
