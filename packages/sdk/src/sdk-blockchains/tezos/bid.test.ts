import { toBigNumber, toCollectionId, toCurrencyId, toItemId } from "@rarible/types"
import BigNumber from "bignumber.js"
import type { TezosFTAssetType } from "@rarible/api-client"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/prepare"
import { retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { awaitItemSupply } from "../../common/test/await-item-supply"
import { createTestWallet } from "./test/test-wallet"
import { awaitForOrder } from "./test/await-for-order"
import { awaitForOrderStatus } from "./test/await-for-order-status"
import { convertTezosToCollectionAddress, convertTezosToContractAddress, convertTezosToUnionAddress } from "./common"
import { awaitForOwnership } from "./test/await-for-ownership"
import { getTestContract } from "./test/test-contracts"

describe.skip("bid test", () => {
	const env: RaribleSdkEnvironment = "development"
	const itemOwner = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		env
	)
	const itemOwnerSdk = createRaribleSdk(itemOwner, env, { logs: LogsLevel.DISABLED })

	const bidderWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		env
	)

	const bidderSdk = createRaribleSdk(bidderWallet, env, { logs: LogsLevel.DISABLED })

	const nullFundsWallet = createTestWallet(
		"edskS2YAR6wms6ZWckr7wJYW1cFaEgy9mk1FbnjABsDMyh" +
    "7CUpvCS8Hfy12BcjvsQc1eprKKBMqAEc6FBgCnLLu33KvzYgsd9c",
		env
	)

	const nullFundsWalletSdk = createRaribleSdk(nullFundsWallet, env, { logs: LogsLevel.DISABLED })

	const eurTzContract = getTestContract(env, "eurTzContract")
	const nftContract = getTestContract(env, "nftContract")
	const mtContract = getTestContract(env, "mtContract")
	const wXTZContract = convertTezosToContractAddress("KT1LkKaeLBvTBo6knGeN5RsEunERCaqVcLr9")

	test("bid NFT test", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint.prepare({
			collectionId: toCollectionId(mtContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://QmQ4x5BR7ecGVjyhZ7o87m2rPgzp8sBzxFbM4gtHiQQ6ay",
			supply: 10,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitItemSupply(itemOwnerSdk, mintResult.itemId, "10")

		const bidResponse = await bidderSdk.order.bid.prepare({ itemId: mintResult.itemId })
		const orderId = await bidResponse.submit({
			amount: 9,
			price: "0.000001",
			currency: {
				"@type": "XTZ",
			},
		})

		await awaitForOrder(bidderSdk, orderId)

		// update bid price
		const updateAction = await bidderSdk.order.bidUpdate.prepare({ orderId })
		const updatedBidOrderId = await updateAction.submit({ price: "0.000002" })

		await retry(10, 1000, async () => {
			const order = await bidderSdk.apis.order.getOrderById({
				id: updatedBidOrderId,
			})
			if (order.make.value !== "0.000018") {
				throw new Error("Bid price has been not updated")
			}
		})

		// accept bid by item owner
		const acceptBidResponse = await itemOwnerSdk.order.acceptBid.prepare({ orderId: updatedBidOrderId })
		const fillBidResult = await acceptBidResponse.submit({
			amount: 9,
			infiniteApproval: true,
		})
		await fillBidResult.wait()

		await awaitForOrderStatus(bidderSdk, updatedBidOrderId, "FILLED")
	}, 1500000)

	test("bid NFT test with basic function", async () => {
		const mintResult = await itemOwnerSdk.nft.mint({
			collectionId: convertTezosToCollectionAddress(nftContract),
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
		})
		await mintResult.transaction.wait()

		await awaitItemSupply(itemOwnerSdk, mintResult.itemId, "1")

		const orderId = await bidderSdk.order.bid({
			itemId: mintResult.itemId,
			amount: 1,
			price: "0.000002",
			currency: {
				"@type": "TEZOS_FT",
				contract: convertTezosToContractAddress(eurTzContract),
				tokenId: toBigNumber("0"),
			},
		})

		await awaitForOrder(bidderSdk, orderId)

		// update bid price
		await bidderSdk.order.bidUpdate({
			orderId,
			price: "0.000004",
		})

		await retry(10, 1000, async () => {
			const order = await bidderSdk.apis.order.getOrderById({
				id: orderId,
			})
			if (order.make.value !== "0.000004") {
				throw new Error("Bid price has been not updated")
			}
		})

		// accept bid by item owner
		const fillBidResult = await itemOwnerSdk.order.acceptBid({
			orderId,
			amount: 1,
		})
		await fillBidResult.wait()

		await awaitForOrderStatus(bidderSdk, orderId, "FILLED")
	}, 1500000)

	test.skip("bid MT test", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint.prepare({
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

		await awaitItemSupply(itemOwnerSdk, mintResult.itemId, "10")

		// make bid by bidder
		const bidResponse = await bidderSdk.order.bid.prepare({ itemId: mintResult.itemId })
		const orderId = await bidResponse.submit({
			amount: 3,
			price: "0.00002",
			currency: {
				"@type": "TEZOS_FT",
				contract: eurTzContract,
				tokenId: toBigNumber("0"),
			},
			originFees: [{
				account: convertTezosToUnionAddress(await itemOwner.provider.address()),
				value: 1000,
			}],
		})

		await awaitForOrder(bidderSdk, orderId)

		// update bid price
		const updateAction = await bidderSdk.order.bidUpdate.prepare({ orderId })
		await updateAction.submit({ price: "0.00004" })

		await retry(10, 2000, async () => {
			const order = await bidderSdk.apis.order.getOrderById({
				id: orderId,
			})
			if (order.make.value !== "0.00012") {
				throw new Error("Bid price has been not updated")
			}
		})

		// accept bid by item owner
		const acceptBidResponse = await itemOwnerSdk.order.acceptBid.prepare({ orderId })
		const fillBidResult = await acceptBidResponse.submit({
			amount: 3,
			infiniteApproval: true,
		})
		await fillBidResult.wait()

		await awaitForOrderStatus(bidderSdk, orderId, "FILLED")
	}, 1500000)

	test.skip("bid MT test with CurrencyId", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint.prepare({
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

		await awaitItemSupply(itemOwnerSdk, mintResult.itemId, "10")

		// make bid by bidder
		const bidResponse = await bidderSdk.order.bid.prepare({ itemId: mintResult.itemId })
		const orderId = await bidResponse.submit({
			amount: 3,
			price: "0.00002",
			currency: toCurrencyId(`${eurTzContract}:0`),
			originFees: [{
				account: convertTezosToUnionAddress(await itemOwner.provider.address()),
				value: 1000,
			}],
		})

		const order = await awaitForOrder(bidderSdk, orderId)
		const takeAssetType = order.make.type as TezosFTAssetType
		expect(takeAssetType["@type"]).toEqual("TEZOS_FT")
		expect(takeAssetType.contract).toEqual("TEZOS:KT1Rgf9RNW7gLj7JGn98yyVM34S4St9eudMC")
		expect(takeAssetType.tokenId).toEqual("0")

		// accept bid by item owner
		const acceptBidResponse = await itemOwnerSdk.order.acceptBid.prepare({ orderId })
		const fillBidResult = await acceptBidResponse.submit({
			amount: 3,
			infiniteApproval: true,
		})
		await fillBidResult.wait()

		await awaitForOrderStatus(bidderSdk, orderId, "FILLED")
	}, 1500000)

	test.skip("getConvertValue returns insufficient type", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint.prepare({
			collectionId: convertTezosToCollectionAddress(nftContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitItemSupply(itemOwnerSdk, mintResult.itemId, "1")

		const bidResponse = await nullFundsWalletSdk.order.bid.prepare({ itemId: mintResult.itemId })

		const value = await bidResponse.getConvertableValue({
			assetType: { "@type": "TEZOS_FT", contract: wXTZContract },
			price: "0.00001",
			amount: 1,
			originFees: [{
				account: convertTezosToUnionAddress(await nullFundsWallet.provider.address()),
				value: 1000,
			}],
		})

		if (!value) throw new Error("Convertable value must be non-undefined")
		expect(value.type).toBe("insufficient")
		expect(new BigNumber(value.value).isEqualTo("0.000011")).toBeTruthy()
	})

	test.skip("getConvertValue returns convertable value", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint.prepare({
			collectionId: convertTezosToCollectionAddress(nftContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitItemSupply(itemOwnerSdk, mintResult.itemId, "1")

		// await resetWXTZFunds(bidderWallet, bidderSdk, wXTZContract)

		const bidResponse = await bidderSdk.order.bid.prepare({ itemId: mintResult.itemId })

		const value = await bidResponse.getConvertableValue({
			assetType: { "@type": "TEZOS_FT", contract: wXTZContract },
			price: "0.00001",
			amount: 4,
			originFees: [{
				account: convertTezosToUnionAddress(await nullFundsWallet.provider.address()),
				value: 1000,
			}],
		})

		if (!value) throw new Error("Convertable value must be non-undefined")
		expect(value.type).toBe("convertable")
		expect(new BigNumber(value.value).isEqualTo("0.000044")).toBeTruthy()
	})

	test.skip("getConvertValue returns undefined when passed non-wXTZ contract", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint.prepare({
			collectionId: toCollectionId(mtContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 5,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitItemSupply(itemOwnerSdk, mintResult.itemId, "5")

		// await resetWXTZFunds(bidderWallet, bidderSdk, wXTZContract)

		const bidResponse = await bidderSdk.order.bid.prepare({ itemId: mintResult.itemId })

		const value = await bidResponse.getConvertableValue({
			assetType: { "@type": "TEZOS_FT", contract: eurTzContract },
			price: "0.00001",
			amount: 5,
			originFees: [{
				account: convertTezosToUnionAddress(await nullFundsWallet.provider.address()),
				value: 1000,
			}],
		})

		expect(value).toBe(undefined)
	})

	test.skip("convert currency on bid", async () => {
		const bidderAddress = await bidderWallet.provider.address()

		const mintResponse = await itemOwnerSdk.nft.mint.prepare({
			collectionId: toCollectionId(mtContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 4,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitItemSupply(itemOwnerSdk, mintResult.itemId, "4")

		// await resetWXTZFunds(bidderWallet, bidderSdk, wXTZContract)
		const bidResponse = await bidderSdk.order.bid.prepare({ itemId: mintResult.itemId })

		const wXTZAsset = { "@type": "TEZOS_FT" as const, contract: wXTZContract, tokenId: toBigNumber("0") }

		const bidOrderId = await bidResponse.submit({
			amount: 4,
			price: "0.00002",
			currency: wXTZAsset,
			originFees: [{
				account: convertTezosToUnionAddress(await nullFundsWallet.provider.address()),
				value: 1000,
			}],
		})

		const updateAction = await bidderSdk.order.bidUpdate.prepare({ orderId: bidOrderId })
		await updateAction.submit({ price: "0.00004" })

		const acceptBidResponse = await itemOwnerSdk.order.acceptBid.prepare({ orderId: bidOrderId })
		const acceptBidTx = await acceptBidResponse.submit({
			amount: 4,
			infiniteApproval: true,
		})
		await acceptBidTx.wait()

		await awaitForOwnership(
			bidderSdk,
			toItemId(mintResult.itemId),
			bidderAddress
		)
	})

	test.skip("unwrap wXTZ on accept bid", async () => {
		const bidderAddress = await bidderWallet.provider.address()

		const mintResponse = await itemOwnerSdk.nft.mint.prepare({
			collectionId: convertTezosToCollectionAddress(nftContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitItemSupply(itemOwnerSdk, mintResult.itemId, "1")

		// await resetWXTZFunds(bidderWallet, bidderSdk, wXTZContract)
		const bidResponse = await bidderSdk.order.bid.prepare({ itemId: mintResult.itemId })

		const wXTZAsset = { "@type": "TEZOS_FT" as const, contract: wXTZContract, tokenId: toBigNumber("0") }

		const bidOrderId = await bidResponse.submit({
			amount: 1,
			price: "0.00002",
			currency: wXTZAsset,
			originFees: [{
				account: convertTezosToUnionAddress(await nullFundsWallet.provider.address()),
				value: 1000,
			}],
		})

		const acceptBidResponse = await itemOwnerSdk.order.acceptBid.prepare({ orderId: bidOrderId })
		const acceptBidTx = await acceptBidResponse.submit({
			amount: 1,
			infiniteApproval: true,
			unwrap: true,
		})
		await acceptBidTx.wait()

		await awaitForOwnership(
			bidderSdk,
			toItemId(mintResult.itemId),
			bidderAddress
		)

	})

})
