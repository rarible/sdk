import { toBigNumber, toContractAddress, toItemId, toUnionAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { createTestWallet } from "./test/test-wallet"
import { awaitForOwnership } from "./test/await-for-ownership"

describe("test tezos mint and sell", () => {
	const sellerWallet = createTestWallet(
		"edskS143x9JtTcFUxE5UDT9Tajkx9hdLha9mQhijSarwsKM6fzBEAuMEttFEjBYL7pT4o5P5yRqFGhUmqEynwviMk5KJ8iMgTw"
	)
	const sellerSdk = createRaribleSdk(sellerWallet, "dev", { logs: LogsLevel.DISABLED })

	const buyerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const buyerSdk = createRaribleSdk(buyerWallet, "dev", { logs: LogsLevel.DISABLED })

	const nextBuyerWallet = createTestWallet(
		"edskS4QxJFDSkHaf6Ax3ByfrZj5cKvLUR813uqwE94baan31c1cPPTMvoAvUKbEv2xM9mvtwoLANNTBSdyZf3CCyN2re7qZyi3"
	)
	const nextBuyerSdk = createRaribleSdk(nextBuyerWallet, "dev", { logs: LogsLevel.DISABLED })

	const eurTzContract = "KT1Rgf9RNW7gLj7JGn98yyVM34S4St9eudMC"
	let nftContract: string = "KT1Ctz9vuC6uxsBPD4GbdbPaJvZogWhE9SLu"
	let mtContract: string = "KT1BMB8m1QKqbbDDZPXpmGVCaM1cGcpTQSrw"

	test.skip("sale NFT with XTZ", async () => {
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

		const fillResponse = await buyerSdk.order.buy({ orderId: mintResult.orderId })

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

	test.skip("sale NFT with eurTZ", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
			collectionId: toContractAddress(`TEZOS:${nftContract}`),
		})

		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: {
				"@type": "TEZOS_FT",
				contract: toContractAddress(
					`TEZOS:${eurTzContract}`
				),
				tokenId: toBigNumber("0"),
			},
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})

		const fillResponse = await buyerSdk.order.buy({ orderId: mintResult.orderId })

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

	test.skip("sale MT with XTZ", async () => {
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

		const fillResponse = await buyerSdk.order.buy({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 10,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("10")
	})

	test.skip("item creator should receive royalty from resale MT with XTZ", async () => {
		const itemCreatorAddress = await sellerWallet.provider.address()

		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
			collectionId: toContractAddress(`TEZOS:${mtContract}`),
		})

		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("1"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
			royalties: [{
				account: toUnionAddress(`TEZOS:${await sellerWallet.provider.address()}`),
				value: 1000,
			}],
		})

		const xtzAssetType = { "@type": "XTZ" as const }

		const fillResponse = await buyerSdk.order.buy({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await fillResult.wait()
		// sell from item creator to the buyer is finished

		const sellAction = await buyerSdk.order.sell({
			itemId: mintResult.itemId,
		})
		const sellOrderId = await sellAction.submit({
			price: new BigNumber("1"),
			currency: { "@type": "XTZ" },
			amount: 1,
		})

		const itemCreatorBalance = await sellerSdk.balances.getBalance(
			toUnionAddress(`TEZOS:${itemCreatorAddress}`),
			xtzAssetType
		)

		const buyerBalance = await buyerSdk.balances.getBalance(
			toUnionAddress(`TEZOS:${await buyerWallet.provider.address()}`),
			xtzAssetType
		)

		const nextBuyerFillResponse = await nextBuyerSdk.order.buy({ orderId: sellOrderId })
		const nextBuyerFillResult = await nextBuyerFillResponse.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await nextBuyerFillResult.wait()
		// sell from buyer to the next buyer is finished

		const buyerFinishBalance = await buyerSdk.balances.getBalance(
			toUnionAddress(`TEZOS:${await buyerWallet.provider.address()}`),
			xtzAssetType
		)

		const buyerBalanceDiff = new BigNumber(buyerFinishBalance).minus(new BigNumber(buyerBalance))
		expect(buyerBalanceDiff.eq("0.9")).toBeTruthy()

		const sellerInitBalanceEnd = await sellerSdk.balances.getBalance(
			toUnionAddress(`TEZOS:${itemCreatorAddress}`),
			xtzAssetType
		)

		const creatorRoyalty = new BigNumber(sellerInitBalanceEnd).minus(new BigNumber(itemCreatorBalance))
		expect(creatorRoyalty.eq(new BigNumber("0.1"))).toBeTruthy()
	})

	test.skip("sale MT with eurTZ", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
			collectionId: toContractAddress(`TEZOS:${mtContract}`),
		})

		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: {
				"@type": "TEZOS_FT",
				contract: toContractAddress(
					`TEZOS:${eurTzContract}`
				),
				tokenId: toBigNumber("0"),
			},
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 10,
			lazyMint: false,
		})

		const fillResponse = await buyerSdk.order.buy({ orderId: mintResult.orderId })

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
})
