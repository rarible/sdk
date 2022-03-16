import { SolanaKeypairWallet } from "@rarible/solana-wallet/src"
import { SolanaWallet } from "@rarible/sdk-wallet"
import { SolanaSdk } from "@rarible/solana-sdk"
import { toBigNumber, toItemId } from "@rarible/types"
import { createRaribleSdk } from "../../index"

describe("Solana sell", () => {
	const wallet = SolanaKeypairWallet.createFrom(Uint8Array.from([
		99, 87, 171, 135, 138, 126, 92, 128, 190, 64, 22,
		156, 36, 13, 155, 14, 214, 77, 78, 101, 109, 150,
		94, 234, 196, 21, 218, 230, 47, 10, 188, 156, 22,
		203, 117, 122, 86, 152, 247, 27, 69, 100, 69, 12,
		18, 49, 12, 192, 255, 53, 207, 73, 136, 97, 31,
		162, 159, 106, 115, 88, 189, 176, 183, 218,
	]))
	const buyerWallet = SolanaKeypairWallet.createFrom(Uint8Array.from([
		95, 7, 178, 206, 40, 211, 26, 11, 231, 5, 170,
		238, 66, 255, 253, 120, 206, 37, 238, 179, 226, 149,
		152, 249, 70, 149, 165, 216, 57, 48, 186, 183, 37,
		133, 254, 50, 205, 43, 152, 131, 54, 75, 66, 244,
		110, 229, 101, 18, 38, 62, 201, 39, 245, 109, 226,
		73, 236, 37, 143, 180, 126, 229, 117, 206,
	]))
	const solanaSdk = SolanaSdk.create({ connection: { cluster: "devnet" } })
	const sdk = createRaribleSdk(new SolanaWallet(wallet), "dev")
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
