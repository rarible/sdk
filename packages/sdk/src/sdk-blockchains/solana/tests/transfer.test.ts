import { toCurrencyId, toUnionAddress } from "@rarible/types"
import { getWallet } from "../common/test/test-wallets"
import { retry } from "../../../common/retry"
import { mintToken } from "../common/test/mint"
import { createSdk } from "../common/test/create-sdk"

describe("Solana transfer", () => {
	const wallet = getWallet()
	const receiverWallet = getWallet(1)
	const sdk = createSdk(wallet)

	test("Should transfer nft", async () => {
		const item = await mintToken(sdk)
		const itemId = item.id

		let balance = await retry(10, 4000, async () => {
			const balance = await sdk.balances.getBalance(
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
			const burn = await sdk.nft.transfer({ itemId })
			return burn.submit({
				to: toUnionAddress("SOLANA:" + receiverWallet.publicKey),
				amount: parseFloat(balance.toString()),
			})
		})
		await tx.wait()

		balance = await retry(10, 4000, async () => {
			const balance = await sdk.balances.getBalance(
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
})
