import { SolanaKeypairWallet } from "@rarible/solana-wallet/src"
import { SolanaWallet } from "@rarible/sdk-wallet"
import { SolanaSdk } from "@rarible/solana-sdk"
import { toBigNumber, toItemId } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { getWallet } from "./common/test/test-wallets"

describe("Solana sell", () => {
	const wallet = getWallet(0)
	const buyerWallet = getWallet(1)
	const solanaSdk = SolanaSdk.create({ connection: { cluster: "devnet" } })
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "dev", { logs: LogsLevel.DISABLED })
	const buyerSdk = createRaribleSdk(new SolanaWallet(buyerWallet), "dev")
	test("Should sell NFT item", async () => {
		const { txId, mint } = await solanaSdk.nft.mint({
			signer: wallet,
			metadataUrl: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
			maxSupply: 1,
			collection: null,
		})

		expect(mint).toBeTruthy()
		await solanaSdk.confirmTransaction(txId, "max")
		const itemId = toItemId(`SOLANA:${mint.toString()}`)

		const sell = await sdk.order.sell({ itemId })
		const orderId = await sell.submit({
			amount: 1,
			currency: {
				"@type": "SOLANA_SOL",
			},
			price: toBigNumber("0.001"),
		})

		const buy = await buyerSdk.order.buy({
			orderId,
			mint: itemId,
			maker: wallet.publicKey,
			taker: buyerWallet.publicKey,
		} as any)

		const tx = await buy.submit({
			amount: 1,
			itemId,
		})

		expect(tx.hash()).toBeTruthy()
		await tx.wait()
		expect(tx.getTxLink()).toBeTruthy()
	})
})
