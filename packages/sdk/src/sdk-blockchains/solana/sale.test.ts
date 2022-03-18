import { SolanaWallet } from "@rarible/sdk-wallet"
import { SolanaSdk } from "@rarible/solana-sdk"
import { toBigNumber, toContractAddress, toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import { OrderStatus, Platform } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { getWallet } from "./common/test/test-wallets"
import { getAuctionHouse } from "./common/auction-house"

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
			order: {
				id: toOrderId("SOLANA:1111111"),
				fill: toBigNumber("1"),
				platform: Platform.RARIBLE,
				status: OrderStatus.ACTIVE,
				makeStock: toBigNumber("1"),
				cancelled: false,
				createdAt: "2022-03-15:10:00:00",
				lastUpdatedAt: "2022-03-15:10:00:00",
				makePrice: toBigNumber("0.001"),
				takePrice: toBigNumber("0.001"),
				maker: toUnionAddress("SOLANA:" + wallet.publicKey.toString()),
				taker: toUnionAddress("SOLANA:" + buyerWallet.publicKey.toString()),
				make: {
					type: { "@type": "SOLANA_NFT", itemId: itemId },
					value: toBigNumber("1"),
				},
				take: {
					type: { "@type": "SOLANA_SOL" },
					value: toBigNumber("0.001"),
				},
				salt: "salt",
				data: {
					"@type": "SOLANA_AUCTION_HOUSE_V1",
					auctionHouse: toContractAddress("SOLANA:" + getAuctionHouse("SOL").toString()),
				},
			},
		})

		const tx = await buy.submit({
			amount: 1,
			itemId,
		})

		expect(tx.hash()).toBeTruthy()
		await tx.wait()
		expect(tx.getTxLink()).toBeTruthy()
	})
})
