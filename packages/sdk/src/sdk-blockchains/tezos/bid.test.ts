import { toBigNumber, toContractAddress, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import BigNumber from "bignumber.js"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { retry } from "../../common/retry"
import { createTestWallet } from "./test/test-wallet"
import { awaitForItemSupply } from "./test/await-for-item-supply"
import { awaitForOrder } from "./test/await-for-order"
import { awaitForOrderStatus } from "./test/await-for-order-status"
import { convertTezosToUnionAddress } from "./common"

describe("bid test", () => {
	const itemOwner = createTestWallet(
		"edskS143x9JtTcFUxE5UDT9Tajkx9hdLha9mQhijSarwsKM6fzBEAuMEttFEjBYL7pT4o5P5yRqFGhUmqEynwviMk5KJ8iMgTw"
	)

	const itemOwnerSdk = createRaribleSdk(
		itemOwner,
		"dev"
	)

	const bidderWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj")

	const bidderSdk = createRaribleSdk(bidderWallet, "dev")

	const walletForConvert = createTestWallet(
		"edskS4QxJFDSkHaf6Ax3ByfrZj5cKvLUR813uqwE94baan31" +
    "c1cPPTMvoAvUKbEv2xM9mvtwoLANNTBSdyZf3CCyN2re7qZyi3")

	const converterSdk = createRaribleSdk(walletForConvert, "dev")

	const eurTzContract = "KT1Rgf9RNW7gLj7JGn98yyVM34S4St9eudMC"
	const nftContract: string = "KT1Ctz9vuC6uxsBPD4GbdbPaJvZogWhE9SLu"
	const wXTZContract = toContractAddress(`${Blockchain.TEZOS}:KT1LkKaeLBvTBo6knGeN5RsEunERCaqVcLr9`)

	test("bid NFT test", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${nftContract}`),
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
				contract: toContractAddress(
					`TEZOS:${eurTzContract}`
				),
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

	test("getConvertValue returns insufficient type", async () => {
		const mintResponse = await itemOwnerSdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${nftContract}`),
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

		const walletAddress = await bidderWallet.provider.address()


		const value = await bidResponse.getConvertableValue(
			{ "@type": "TEZOS_FT", contract: wXTZContract },
			"0.0000001",
			convertTezosToUnionAddress(walletAddress)
		)

		console.log("value", value, value && value.value.toString())
	})

	test("convertCurrency", async () => {
		const walletAddress = await walletForConvert.provider.address()

		const mintResponse = await itemOwnerSdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${nftContract}`),
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
		const bidResponse = await converterSdk.order.bid({ itemId: mintResult.itemId })

		const walletUnionAddress = convertTezosToUnionAddress(walletAddress)
		const wXTZAsset = { "@type": "TEZOS_FT" as const, contract: wXTZContract, tokenId: toBigNumber("0") }

		const wXTZInitBalance = await converterSdk.balances.getBalance(walletUnionAddress, wXTZAsset)

		const convertTx = await bidResponse.convert(
			{ "@type": "XTZ" },
			{ "@type": "TEZOS_FT", contract: wXTZContract },
			"0.000001"
		)

		await convertTx.wait()

		const wXTZFinishBalance = await converterSdk.balances.getBalance(walletUnionAddress, wXTZAsset)
		expect(
			new BigNumber(wXTZFinishBalance).minus(wXTZInitBalance).toString()
		).toEqual("0.000001")
		console.log("wXTZBalance", wXTZFinishBalance.toString())
	})

})
