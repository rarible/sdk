import { toCollectionId, toCurrencyId, toUnionAddress } from "@rarible/types"
import { SolanaWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { MintType } from "../../../types/nft/mint/domain"
import { retry } from "../../../common/retry"

describe("Solana burn", () => {
	const wallet = getWallet()
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "development", { logs: LogsLevel.DISABLED })

	test("Should burn NFT", async () => {
		const mint = await sdk.nft.mint({
			collectionId: toCollectionId("SOLANA:Ev9n3xAfCrxPrUSUN4mLorwfaknjj4QMcyLUnbPymSmJ"),
		})

		const mintRes = await mint.submit({
			supply: 0,
			lazyMint: false,
			uri: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
		})

		if (mintRes.type === MintType.ON_CHAIN) {
			await mintRes.transaction.wait()
		}

		let balance = await retry(10, 4000, async () => {
			const balance = await sdk.balances.getBalance(
				toUnionAddress("SOLANA:" + wallet.publicKey),
				{ "@type": "SOLANA_NFT", itemId: mintRes.itemId },
			)
			if (parseFloat(balance.toString()) < 1) {
				throw new Error(`Wrong balance value. Expected ${1}. Actual: ${parseFloat(balance.toString())}`)
			}
			return balance
		})
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)

		const tx = await retry(10, 4000, async () => {
			const burn = await sdk.nft.burn({ itemId: mintRes.itemId })
			return burn.submit({ amount: parseFloat(balance.toString()) })
		})
		await tx?.wait()

		balance = await retry(10, 4000, async () => {
			const balance = await sdk.balances.getBalance(
				toUnionAddress("SOLANA:" + wallet.publicKey),
				toCurrencyId(mintRes.itemId),
			)
			if (parseFloat(balance.toString()) !== 0) {
				throw new Error(`Wrong balance value. Expected ${0}. Actual: ${parseFloat(balance.toString())}`)
			}
			return balance
		})
		expect(parseFloat(balance.toString())).toEqual(0)
	})
})
