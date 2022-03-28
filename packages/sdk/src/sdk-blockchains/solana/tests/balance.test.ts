import { toItemId, toUnionAddress } from "@rarible/types"
import { SolanaWallet } from "@rarible/sdk-wallet"
import { SolanaSdk } from "@rarible/solana-sdk"
import { createRaribleSdk } from "../../../index"
import { LogsLevel } from "../../../domain"
import { getWallet } from "../common/test/test-wallets"

describe("Solana get balance", () => {
	const wallet = getWallet()
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "dev", { logs: LogsLevel.DISABLED })
	const solanaSdk = SolanaSdk.create({ connection: { cluster: "devnet" } })

	test("get balance SOL", async () => {
		const balance = await sdk.balances.getBalance(
			toUnionAddress("SOLANA:" + wallet.publicKey),
			{ "@type": "SOLANA_SOL" }
		)
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
	})

	test("get balance NFT", async () => {
		const { txId, mint } = await solanaSdk.nft.mint({
			signer: wallet,
			metadataUrl: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
			maxSupply: 1,
			collection: null,
		})

		await solanaSdk.confirmTransaction(txId, "max")

		const balance = await sdk.balances.getBalance(
			toUnionAddress("SOLANA:" + wallet.publicKey),
			{ "@type": "SOLANA_NFT", itemId: toItemId("SOLANA:" + mint.toString()) }
		)
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
	})
})
