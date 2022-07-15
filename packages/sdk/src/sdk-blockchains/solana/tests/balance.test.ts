import { toCollectionId, toCurrencyId, toUnionAddress, ZERO_ADDRESS } from "@rarible/types"
import { getWallet } from "../common/test/test-wallets"
import { MintType } from "../../../types/nft/mint/domain"
import { retry } from "../../../common/retry"
import { createSdk } from "../common/test/create-sdk"

describe("Solana get balance", () => {
	const wallet = getWallet()
	const sdk = createSdk(wallet)

	test("get balance SOL", async () => {
		const balance = await sdk.balances.getBalance(
			toUnionAddress("SOLANA:" + wallet.publicKey),
			toCurrencyId(`SOLANA:${ZERO_ADDRESS}`)
		)
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
	})

	test("get balance NFT", async () => {
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

		const balance = await retry(10, 4000, async () => {
			const balance = await sdk.balances.getBalance(
				toUnionAddress("SOLANA:" + wallet.publicKey),
				toCurrencyId(mintRes.itemId),
			)
			if (parseFloat(balance.toString()) < 1) {
				throw new Error(`Wrong balance value. Expected ${1}. Actual: ${balance.toString()}`)
			}
			return balance
		})
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
	})
})
