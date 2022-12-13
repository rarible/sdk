import { toBigNumber, toCollectionId, toCurrencyId, toItemId, toUnionAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import type { TezosXTZAssetType } from "@rarible/api-client"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { MintType } from "../../types/nft/mint/prepare"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { awaitItem } from "../../common/test/await-item"
// import { awaitItemSupply } from "../ethereum/test/await-item-supply"
import { createTestWallet } from "./test/test-wallet"
import { awaitForOwnership } from "./test/await-for-ownership"
import { awaitForOrder } from "./test/await-for-order"
import { getTestContract } from "./test/test-contracts"

describe.skip("test tezos mint and sell", () => {
	const env: RaribleSdkEnvironment = "testnet"

	const sellerWallet = createTestWallet("edskS143x9JtTcFUxE5UDT9Tajkx9hdLha9mQhijSarwsKM6fzBEAuMEttFEjBYL7pT4o5P5yRqFGhUmqEynwviMk5KJ8iMgTw", env)
	const buyerWallet = createTestWallet("edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj", env)
	const nextBuyerWallet = createTestWallet("edskS4QxJFDSkHaf6Ax3ByfrZj5cKvLUR813uqwE94baan31c1cPPTMvoAvUKbEv2xM9mvtwoLANNTBSdyZf3CCyN2re7qZyi3", env)
	const it = awaitAll({
		sellerSdk: createRaribleSdk(sellerWallet, env, { logs: LogsLevel.DISABLED }),
		buyerSdk: createRaribleSdk(buyerWallet, env, { logs: LogsLevel.DISABLED }),
		nextBuyerSdk: createRaribleSdk(nextBuyerWallet, env, { logs: LogsLevel.DISABLED }),
	})

	const eurTzContract = getTestContract(env, "eurTzContract")
	const fa12Contract = getTestContract(env, "fa12Contract")
	const nftContract: string = getTestContract(env, "nftContract")
	const mtContract: string = getTestContract(env, "mtContract")

	test("sale NFT with XTZ", async () => {
		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell.prepare({
			collectionId: toCollectionId(nftContract),
		})

		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		await awaitItem(it.sellerSdk, mintResult.itemId)
		await awaitForOrder(it.sellerSdk, mintResult.orderId)

		const fillResponse = await it.buyerSdk.order.buy.prepare({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			it.buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("1")
	})

	test("sale with mintAndSell NFT with XTZ", async () => {

		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell.prepare({
			collectionId: toCollectionId(nftContract),
		})

		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		await awaitItem(it.sellerSdk, mintResult.itemId)
		await awaitForOrder(it.sellerSdk, mintResult.orderId)

		const fillResponse = await it.buyerSdk.order.buy.prepare({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			it.buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("1")
	})

	test("sale with mintAndSell NFT with XTZ with basic function", async () => {

		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell({
			collectionId: toCollectionId(nftContract),
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
		})

		await mintAndSellAction.transaction.wait()
		await awaitItem(it.sellerSdk, mintAndSellAction.itemId)

		const fillResponse = await it.buyerSdk.order.buy({
			orderId: mintAndSellAction.orderId,
			amount: 1,
			infiniteApproval: true,
		})
		await fillResponse.wait()

		const ownership = await awaitForOwnership(
			it.buyerSdk,
			toItemId(mintAndSellAction.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("1")
	})

	test("sale NFT with XTZ and with CurrencyId", async () => {
		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell.prepare({
			collectionId: toCollectionId(nftContract),
		})

		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: toCurrencyId("TEZOS:tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU"),
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})

		const order = await awaitForOrder(it.sellerSdk, mintResult.orderId)
		const takeAssetType = order.take.type as TezosXTZAssetType
		expect(takeAssetType["@type"]).toEqual("XTZ")

		const fillResponse = await it.buyerSdk.order.buy.prepare({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			it.buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("1")
	})

	test("sale NFT with eurTZ", async () => {
		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell.prepare({
			collectionId: toCollectionId(nftContract),
		})

		const mintResult = await mintAndSellAction.submit({
			price: "0.0001",
			currency: {
				"@type": "TEZOS_FT",
				contract: eurTzContract,
			},
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		const fillResponse = await it.buyerSdk.order.buy.prepare({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			it.buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("1")
	})

	test("sale MT with XTZ", async () => {
		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell.prepare({
			collectionId: toCollectionId(mtContract),
		})

		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: { "@type": "XTZ" },
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 10,
			lazyMint: false,
		})

		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		const fillResponse = await it.buyerSdk.order.buy.prepare({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 10,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			it.buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("10")
	})

	test("item creator should receive royalty from resale MT with XTZ", async () => {
		const itemCreatorAddress = await sellerWallet.provider.address()

		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell.prepare({
			collectionId: toCollectionId(mtContract),
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

		const fillResponse = await it.buyerSdk.order.buy.prepare({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await fillResult.wait()
		// sell from item creator to the buyer is finished

		const sellAction = await it.buyerSdk.order.sell.prepare({
			itemId: mintResult.itemId,
		})
		const sellOrderId = await sellAction.submit({
			price: new BigNumber("1"),
			currency: { "@type": "XTZ" },
			amount: 1,
		})

		const itemCreatorBalance = await it.sellerSdk.balances.getBalance(
			toUnionAddress(`TEZOS:${itemCreatorAddress}`),
			xtzAssetType
		)

		const buyerBalance = await it.buyerSdk.balances.getBalance(
			toUnionAddress(`TEZOS:${await buyerWallet.provider.address()}`),
			xtzAssetType
		)

		const nextBuyerFillResponse = await it.nextBuyerSdk.order.buy.prepare({ orderId: sellOrderId })
		const nextBuyerFillResult = await nextBuyerFillResponse.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await nextBuyerFillResult.wait()
		// sell from buyer to the next buyer is finished

		const buyerFinishBalance = await it.buyerSdk.balances.getBalance(
			toUnionAddress(`TEZOS:${await buyerWallet.provider.address()}`),
			xtzAssetType
		)

		const buyerBalanceDiff = new BigNumber(buyerFinishBalance).minus(new BigNumber(buyerBalance))
		expect(buyerBalanceDiff.eq("0.9")).toBeTruthy()

		const sellerInitBalanceEnd = await it.sellerSdk.balances.getBalance(
			toUnionAddress(`TEZOS:${itemCreatorAddress}`),
			xtzAssetType
		)

		const creatorRoyalty = new BigNumber(sellerInitBalanceEnd).minus(new BigNumber(itemCreatorBalance))
		expect(creatorRoyalty.eq(new BigNumber("0.1"))).toBeTruthy()
	})

	test("sale MT with FA12", async () => {
		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell.prepare({
			collectionId: toCollectionId(mtContract),
		})

		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("0.1"),
			currency: {
				"@type": "TEZOS_FT",
				contract: fa12Contract,
			},
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 10,
			lazyMint: false,
		})

		await awaitItem(it.sellerSdk, mintResult.itemId)
		await awaitForOrder(it.sellerSdk, mintResult.orderId)

		const fillResponse = await it.buyerSdk.order.buy.prepare({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 4,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			it.buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("4")
	})

	test("sale MT with FA2", async () => {
		const mintAndSellAction = await it.sellerSdk.nft.mintAndSell.prepare({
			collectionId: toCollectionId(mtContract),
		})

		const expirationDate = new Date(Date.now() + 100 * 1000)
		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("0.002"),
			currency: {
				"@type": "TEZOS_FT",
				contract: eurTzContract,
				tokenId: toBigNumber("0"),
			},
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 10,
			lazyMint: false,
			expirationDate: expirationDate,
		})

		await awaitForOrder(it.sellerSdk, mintResult.orderId)

		const updateAction = await it.sellerSdk.order.sellUpdate.prepare({
			orderId: mintResult.orderId,
		})
		const updatedOrderId = await updateAction.submit({ price: "0.001" })

		const fillResponse = await it.buyerSdk.order.buy.prepare({ orderId: updatedOrderId })

		const fillResult = await fillResponse.submit({
			amount: 5,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			it.buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("5")
	})
})
