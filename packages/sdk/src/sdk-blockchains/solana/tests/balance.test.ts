import { toContractAddress, toUnionAddress } from "@rarible/types"
import { SolanaWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { MintType } from "../../../types/nft/mint/domain"

describe("Solana get balance", () => {
	const wallet = getWallet()
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "dev", { logs: LogsLevel.DISABLED })

	test("get balance SOL", async () => {
		const balance = await sdk.balances.getBalance(
			toUnionAddress("SOLANA:" + wallet.publicKey),
			{ "@type": "SOLANA_SOL" }
		)
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
	})

	test("get balance NFT", async () => {
		const mint = await sdk.nft.mint({
			collectionId: toContractAddress("SOLANA:65DNtgn5enhi6QXevn64jFq41Qgv71bvr8UVVwGiYkLJ"),
		})

		const mintRes = await mint.submit({
			supply: 1,
			lazyMint: false,
			uri: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
		})

		if (mintRes.type === MintType.ON_CHAIN) {
			await mintRes.transaction.wait()
		}

		const balance = await sdk.balances.getBalance(
			toUnionAddress("SOLANA:" + wallet.publicKey),
			{ "@type": "SOLANA_NFT", itemId: mintRes.itemId }
		)
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
	})
})
