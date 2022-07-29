import { toBigNumber, toCollectionId, toCurrencyId, toItemId, toUnionAddress } from "@rarible/types"
import BigNumber from "bignumber.js"
import type { TezosXTZAssetType } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { MintType } from "../../types/nft/mint/domain"
import { awaitItem } from "../ethereum/test/await-item"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { createApisSdk } from "../../common/apis"
import { getSdkConfig } from "../../config"
import { awaitItemSupply } from "../ethereum/test/await-item-supply"
import { createTestWallet } from "./test/test-wallet"
import { awaitForOwnership } from "./test/await-for-ownership"
import { awaitForOrder } from "./test/await-for-order"
import { getTestContract } from "./test/test-contracts"
import { getMaybeTezosProvider } from "./common"
import { TezosSell } from "./sell"

describe.skip("test tezos mint and sell", () => {
	const env: RaribleSdkEnvironment = "testnet"

	const sellerWallet = createTestWallet("edskS143x9JtTcFUxE5UDT9Tajkx9hdLha9mQhijSarwsKM6fzBEAuMEttFEjBYL7pT4o5P5yRqFGhUmqEynwviMk5KJ8iMgTw", env)
	const sellerSdk = createRaribleSdk(sellerWallet, env, { logs: LogsLevel.DISABLED })

	const buyerWallet = createTestWallet("edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj", env)
	const buyerSdk = createRaribleSdk(buyerWallet, env, { logs: LogsLevel.DISABLED })

	const nextBuyerWallet = createTestWallet("edskS4QxJFDSkHaf6Ax3ByfrZj5cKvLUR813uqwE94baan31c1cPPTMvoAvUKbEv2xM9mvtwoLANNTBSdyZf3CCyN2re7qZyi3", env)
	const nextBuyerSdk = createRaribleSdk(nextBuyerWallet, env, { logs: LogsLevel.DISABLED })

	const eurTzContract = getTestContract(env, "eurTzContract")
	const fa12Contract = getTestContract(env, "fa12Contract")
	const nftContract: string = getTestContract(env, "nftContract")
	const mtContract: string = getTestContract(env, "mtContract")

	const sdkConfig = getSdkConfig(env)
	const sellerTezosProvider = getMaybeTezosProvider(sellerWallet.provider, sdkConfig.tezosNetwork, sdkConfig)
	const unionApis = createApisSdk(env, undefined)
	const sellerSellService = new TezosSell(sellerTezosProvider, unionApis)

	test("sale NFT with XTZ", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
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
		await awaitItem(sellerSdk, mintResult.itemId)
		await awaitForOrder(sellerSdk, mintResult.orderId)

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

	test("sale with mintAndSell NFT with XTZ", async () => {

		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
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
		await awaitItem(sellerSdk, mintResult.itemId)
		await awaitForOrder(sellerSdk, mintResult.orderId)

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

	test("sale NFT with XTZ and with CurrencyId", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
			collectionId: toCollectionId(nftContract),
		})

		const mintResult = await mintAndSellAction.submit({
			price: new BigNumber("0.0001"),
			currency: toCurrencyId("TEZOS:tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU"),
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})

		const order = await awaitForOrder(sellerSdk, mintResult.orderId)
		const takeAssetType = order.take.type as TezosXTZAssetType
		expect(takeAssetType["@type"]).toEqual("XTZ")

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

	test("sale NFT with eurTZ", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
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

	test("sale MT with XTZ", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
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

	test("item creator should receive royalty from resale MT with XTZ", async () => {
		const itemCreatorAddress = await sellerWallet.provider.address()

		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
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

	test("sale MT with FA12", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
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

		await awaitItem(sellerSdk, mintResult.itemId)
		await awaitForOrder(sellerSdk, mintResult.orderId)

		const fillResponse = await buyerSdk.order.buy({ orderId: mintResult.orderId })

		const fillResult = await fillResponse.submit({
			amount: 4,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("4")
	})

	test("sale MT with FA2", async () => {
		const mintAndSellAction = await sellerSdk.nft.mintAndSell({
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

		await awaitForOrder(sellerSdk, mintResult.orderId)

		const updateAction = await sellerSdk.order.sellUpdate({
			orderId: mintResult.orderId,
		})
		const updatedOrderId = await updateAction.submit({ price: "0.001" })

		const fillResponse = await buyerSdk.order.buy({ orderId: updatedOrderId })

		const fillResult = await fillResponse.submit({
			amount: 5,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("5")
	})

	test("sale MT <-> FA2 with v1 order", async () => {
		const mintResponse = await sellerSdk.nft.mint({
			collectionId: toCollectionId(mtContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 10,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}
		await awaitItemSupply(sellerSdk, mintResult.itemId, "10")

		const orderId = await sellerSellService.sellV1({
			itemId: mintResult.itemId,
			amount: 5,
			price: "0.002",
			currency: {
				"@type": "TEZOS_FT",
				contract: eurTzContract,
				tokenId: toBigNumber("0"),
			},
		})

		await awaitForOrder(sellerSdk, orderId)

		const fillResponse = await buyerSdk.order.buy({ orderId })

		const fillResult = await fillResponse.submit({
			amount: 5,
			infiniteApproval: true,
		})
		await fillResult.wait()

		const ownership = await awaitForOwnership(
			buyerSdk,
			toItemId(mintResult.itemId),
			await buyerWallet.provider.address()
		)
		expect(ownership.value).toBe("5")
	})
})
