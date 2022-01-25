import { toBigNumber, toItemId } from "@rarible/types"
import BigNumber from "bignumber.js"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import { createTestWallet } from "./test/test-wallet"
import { awaitForItemSupply } from "./test/await-for-item-supply"
import { awaitForOrder } from "./test/await-for-order"
import { awaitForOrderStatus } from "./test/await-for-order-status"
import { convertTezosToContractAddress, convertTezosToUnionAddress } from "./common"
import { awaitForOwnership } from "./test/await-for-ownership"
import { resetWXTZFunds } from "./test/reset-wxtz-funds"

describe("bid test", () => {
	const itemOwner = createTestWallet(
		"edskS143x9JtTcFUxE5UDT9Tajkx9hdLha9mQhijSarwsKM6fzBEAuMEttFEjBYL7pT4o5P5yRqFGhUmqEynwviMk5KJ8iMgTw"
	)
	const itemOwnerSdk = createRaribleSdk(itemOwner, "dev", { logs: LogsLevel.DISABLED })

	const bidderWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj")

	const bidderSdk = createRaribleSdk(bidderWallet, "dev", { logs: LogsLevel.DISABLED })

	const nullFundsWallet = createTestWallet(
		"edskS2YAR6wms6ZWckr7wJYW1cFaEgy9mk1FbnjABsDMyh" +
    "7CUpvCS8Hfy12BcjvsQc1eprKKBMqAEc6FBgCnLLu33KvzYgsd9c")

	const nullFundsWalletSdk = createRaribleSdk(nullFundsWallet, "dev")

	const eurTzContract = "KT1Rgf9RNW7gLj7JGn98yyVM34S4St9eudMC"
	const nftContract: string = "KT1Ctz9vuC6uxsBPD4GbdbPaJvZogWhE9SLu"
	const wXTZContract = convertTezosToContractAddress("KT1LkKaeLBvTBo6knGeN5RsEunERCaqVcLr9")

	test.skip("bid NFT test", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint({
			collectionId: convertTezosToContractAddress(nftContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitForItemSupply(itemOwnerSdk, mintResult.itemId, "1")

		// make bid by bidder
		const bidResponse = await bidderSdk.order.bid({ itemId: mintResult.itemId })
		const orderId = await bidResponse.submit({
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
		const updateAction = await bidderSdk.order.bidUpdate({ orderId })
		await updateAction.submit({ price: "0.000004" })

		await retry(10, 1000, async () => {
			const order = await bidderSdk.apis.order.getOrderById({
				id: orderId,
			})
			if (order.make.value !== "0.000004") {
				throw new Error("Bid price has been not updated")
			}
		})

		// accept bid by item owner
		const acceptBidResponse = await itemOwnerSdk.order.acceptBid({ orderId })
		const fillBidResult = await acceptBidResponse.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await fillBidResult.wait()

		await awaitForOrderStatus(bidderSdk, orderId, "FILLED")
	}, 1500000)

	test.skip("getConvertValue returns insufficient type", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint({
			collectionId: convertTezosToContractAddress(nftContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitForItemSupply(itemOwnerSdk, mintResult.itemId, "1")

		const bidResponse = await nullFundsWalletSdk.order.bid({ itemId: mintResult.itemId })

		const value = await bidResponse.getConvertableValue({
			assetType: { "@type": "TEZOS_FT", contract: wXTZContract },
			value: "0.00001",
			originFees: [{
				account: convertTezosToUnionAddress(await nullFundsWallet.provider.address()),
				value: 1000,
			}],
		})

		console.log("value", value)
		if (!value) throw new Error("Convertable value must be non-undefined")
		expect(value.type).toBe("insufficient")
		expect(new BigNumber(value.value).isEqualTo("0.000011")).toBeTruthy()
	})

	test.skip("getConvertValue returns convertable value", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint({
			collectionId: convertTezosToContractAddress(nftContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitForItemSupply(itemOwnerSdk, mintResult.itemId, "1")

		await resetWXTZFunds(bidderWallet, bidderSdk, wXTZContract)

		const bidResponse = await bidderSdk.order.bid({ itemId: mintResult.itemId })

		const value = await bidResponse.getConvertableValue({
			assetType: { "@type": "TEZOS_FT", contract: wXTZContract },
			value: "0.00001",
			originFees: [{
				account: convertTezosToUnionAddress(await nullFundsWallet.provider.address()),
				value: 1000,
			}],
		})

		if (!value) throw new Error("Convertable value must be non-undefined")
		expect(value.type).toBe("convertable")
		expect(new BigNumber(value.value).isEqualTo("0.000011")).toBeTruthy()
	})

	test.skip("getConvertValue returns undefined when passed non-wXTZ contract", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint({
			collectionId: convertTezosToContractAddress(nftContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitForItemSupply(itemOwnerSdk, mintResult.itemId, "1")

		await resetWXTZFunds(bidderWallet, bidderSdk, wXTZContract)

		const bidResponse = await bidderSdk.order.bid({ itemId: mintResult.itemId })

		const value = await bidResponse.getConvertableValue({
			assetType: { "@type": "TEZOS_FT", contract: convertTezosToContractAddress(eurTzContract) },
			value: "0.00001",
			originFees: [{
				account: convertTezosToUnionAddress(await nullFundsWallet.provider.address()),
				value: 1000,
			}],
		})

		expect(value).toBe(undefined)
	})

	test.skip("convert currency on bid", async () => {
		const bidderAddress = await bidderWallet.provider.address()

		const mintResponse = await itemOwnerSdk.nft.mint({
			collectionId: convertTezosToContractAddress(nftContract),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await awaitForItemSupply(itemOwnerSdk, mintResult.itemId, "1")

		await resetWXTZFunds(bidderWallet, bidderSdk, wXTZContract)
		const bidResponse = await bidderSdk.order.bid({ itemId: mintResult.itemId })

		const wXTZAsset = { "@type": "TEZOS_FT" as const, contract: wXTZContract, tokenId: toBigNumber("0") }

		const bidOrderId = await bidResponse.submit({
			amount: 1,
			price: "0.000002",
			currency: wXTZAsset,
		})

		const updateAction = await bidderSdk.order.bidUpdate({ orderId: bidOrderId })
		await updateAction.submit({ price: "0.000004" })

		const acceptBidResponse = await itemOwnerSdk.order.acceptBid({ orderId: bidOrderId })
		const acceptBidTx = await acceptBidResponse.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await acceptBidTx.wait()

		await awaitForOwnership(
			bidderSdk,
			toItemId(mintResult.itemId),
			bidderAddress
		)
	})

})
