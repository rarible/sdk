import { toContractAddress, toItemId } from "@rarible/types"
import BigNumber from "bignumber.js"
import { createRaribleSdk } from "../../index"
import { createTestWallet } from "./test/test-wallet"
import { awaitForOwnership } from "./test/await-for-ownership"

describe("test tezos mint and sell", () => {
	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const sellerSdk = createRaribleSdk(
		sellerWallet,
		"dev"
	)

	const buyerWallet = createTestWallet(
		"edskS143x9JtTcFUxE5UDT9Tajkx9hdLha9mQhijSarwsKM6fzBEAuMEttFEjBYL7pT4o5P5yRqFGhUmqEynwviMk5KJ8iMgTw"
	)
	const buyerSdk = createRaribleSdk(buyerWallet, "dev")


	let nftContract: string = "KT1EWB3JaMmZ5BmNqHVBjB4re62FLihp4G6C"
	let mtContract: string = "KT1XnWcuF4rzKa7WrBC8BozhLBY55fkHBs4s"


	test.skip("sale NFT", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
			collectionId: toContractAddress(`TEZOS:${nftContract}`),
		})

		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})

		const fillResponse = await buyerSdk.order.fill({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("1")
	})

	test("sale MT", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
			collectionId: toContractAddress(`TEZOS:${mtContract}`),
		})

		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 10,
			lazyMint: false,
		})

		const fillResponse = await buyerSdk.order.fill({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 2,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("2")
	})
})
