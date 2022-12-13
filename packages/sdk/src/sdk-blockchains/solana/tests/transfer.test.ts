import { toCurrencyId, toUnionAddress } from "@rarible/types"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"
import { createSdk } from "../common/test/create-sdk"

describe("Solana transfer", () => {
	const wallet = getWallet()
	const receiverWallet = getWallet(1)
	const it = awaitAll({
		sdk: createSdk(wallet),
	})

	test("Should transfer nft", async () => {
		const item = await mintToken(it.sdk)
		const itemId = item.id

		let balance = await retry(10, 4000, async () => {
			const balance = await it.sdk.balances.getBalance(
				toUnionAddress("SOLANA:" + wallet.publicKey),
				toCurrencyId(itemId),
			)
			if (parseFloat(balance.toString()) < 1) {
				throw new Error(`Wrong balance value. Expected ${1}. Actual: ${balance.toString()}`)
			}
			return balance
		})
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)

		const tx = await retry(10, 4000, async () => {
			const burn = await it.sdk.nft.transfer.prepare({ itemId })
			return burn.submit({
				to: toUnionAddress("SOLANA:" + receiverWallet.publicKey),
				amount: parseFloat(balance.toString()),
			})
		})
		await tx.wait()

		balance = await retry(10, 4000, async () => {
			const balance = await it.sdk.balances.getBalance(
				toUnionAddress("SOLANA:" + receiverWallet.publicKey),
				toCurrencyId(itemId),
			)
			if (parseFloat(balance.toString()) < 1) {
				throw new Error(`Wrong balance value. Expected ${1}. Actual: ${balance.toString()}`)
			}
			return balance
		})
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
	})

	test("Should transfer nft with basic function", async () => {
		const item = await mintToken(it.sdk)
		const itemId = item.id

		let balance = await retry(10, 4000, async () => {
			const balance = await it.sdk.balances.getBalance(
				toUnionAddress("SOLANA:" + wallet.publicKey),
				toCurrencyId(itemId),
			)
			if (parseFloat(balance.toString()) < 1) {
				throw new Error(`Wrong balance value. Expected ${1}. Actual: ${parseFloat(balance.toString())}`)
			}
			return balance
		})
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)

		const tx = await retry(10, 4000, async () => {
			return it.sdk.nft.transfer({
				itemId,
				to: toUnionAddress("SOLANA:" + receiverWallet.publicKey),
				amount: parseFloat(balance.toString()),
			})
		})
		await tx.wait()

		balance = await retry(10, 4000, async () => {
			const balance = await it.sdk.balances.getBalance(
				toUnionAddress("SOLANA:" + receiverWallet.publicKey),
				toCurrencyId(itemId),
			)
			if (parseFloat(balance.toString()) < 1) {
				throw new Error(`Wrong balance value. Expected ${1}. Actual: ${parseFloat(balance.toString())}`)
			}
			return balance
		})
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
	})
})
