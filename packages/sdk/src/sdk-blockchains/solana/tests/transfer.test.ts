import { toCollectionId, toUnionAddress } from "@rarible/types"
import { SolanaWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"
import { MintType } from "../../../types/nft/mint/domain"

describe("Solana transfer", () => {
	const wallet = getWallet()
	const receiverWallet = getWallet(1)
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "dev", { logs: LogsLevel.DISABLED })

	test("Should transfer nft", async () => {
		const mint = await sdk.nft.mint({
			collectionId: toCollectionId("SOLANA:65DNtgn5enhi6QXevn64jFq41Qgv71bvr8UVVwGiYkLJ"),
		})

		const mintRes = await mint.submit({
			supply: 1,
			lazyMint: false,
			uri: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
		})

		if (mintRes.type === MintType.ON_CHAIN) {
			await mintRes.transaction.wait()
		}

		let balance = await sdk.balances.getBalance(
			toUnionAddress("SOLANA:" + wallet.publicKey),
			{ "@type": "SOLANA_NFT", itemId: mintRes.itemId }
		)
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)

		const burn = await sdk.nft.transfer({ itemId: mintRes.itemId })
		const tx = await burn.submit({
			to: toUnionAddress("SOLANA:" + receiverWallet.publicKey),
			amount: parseFloat(balance.toString()),
		})
		await tx.wait()

		balance = await sdk.balances.getBalance(
			toUnionAddress("SOLANA:" + receiverWallet.publicKey),
			{ "@type": "SOLANA_NFT", itemId: mintRes.itemId }
		)
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
	})
})
