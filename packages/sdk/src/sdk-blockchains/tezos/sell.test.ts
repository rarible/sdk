// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress, toItemId, toOrderId } from "@rarible/types"
import BigNumber from "bignumber.js"
// import { deploy_mt_public, deploy_nft_public } from "tezos-sdk-module"
import { deploy_mt_public, deploy_nft_public, mint } from "tezos-sdk-module"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { delay, retry } from "../../common/retry"
import { awaitForOrder } from "./test/await-for-order"
import { awaitForItemSupply } from "./test/await-for-item-supply"

describe("sell test", () => {

	const sellerTezos = in_memory_provider(
		// "edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		// "edsk4CmgW9r4fwqtsT6x2bB7BdVcERxLPt6poFXGpk1gTKbqR43G5H",
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		// "edskS143x9JtTcFUxE5UDT9Tajkx9hdLha9mQhijSarwsKM6fzBEAuMEttFEjBYL7pT4o5P5yRqFGhUmqEynwviMk5KJ8iMgTw",
		"https://hangzhou.tz.functori.com",
	)
	const sellerWallet = new TezosWallet(sellerTezos)
	const sellerSdk = createRaribleSdk(sellerWallet, "dev")


	const buyerTezos = in_memory_provider(
		// "edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8",
		// "edsk4CmgW9r4fwqtsT6x2bB7BdVcERxLPt6poFXGpk1gTKbqR43G5H",
		// "edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj",
		"edskS143x9JtTcFUxE5UDT9Tajkx9hdLha9mQhijSarwsKM6fzBEAuMEttFEjBYL7pT4o5P5yRqFGhUmqEynwviMk5KJ8iMgTw",
		"https://hangzhou.tz.functori.com",
	)
	const buyerWallet = new TezosWallet(buyerTezos)
	const buyerSdk = createRaribleSdk(buyerWallet, "dev")

	let nftContract: string = "KT1V1mkq7qeoFG4pf5QinRmMZJoDFaJxgDXj"
	let mtContract: string = "KT1MTdF5FMN6dKUoXBGzvqr7BsWpFikQ4RDd"

	/*
	beforeAll(async () => {
		// "edskRzKnQB3jFrx8qYRedDguFNnrmePpvmAyBt6zTz1RzDm3vVnqtrqhhuM8SupK2gTYgq2jdMGJUgvMXJiG5Vz7Wd6Ub2hFTR",
		const provider = {
			tezos: sellerTezos,
			api: "https://rarible-api.functori.com/v0.1",
			config: {
				exchange: "KT1KkUufmRPjK6SBNZVvAYniAY5F9czYmgwu",
				fees: new BigNumber(0),
				nft_public: "",
				mt_public: "",
			},
		}
		const sender = await sellerTezos.address()
		console.log("sender", sender)
		const nft = await deploy_nft_public(provider, sender)
		console.log("nft", nft.contract)
		await nft.confirmation()
		nftContract = nft.contract as string


		const mt = await deploy_mt_public(provider, sender)
		await mt.confirmation()
		mtContract = mt.contract as string
		console.log("mt", mt.contract)
	})

   */

	test("sell NFT test", async () => {

		/*
		const seller = await sellerTezos.address()
		console.log("seller", seller)
		const mintResponse = await sellerSdk.nft.mint({
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

		await awaitForItemSupply(sellerSdk, mintResult.itemId, "1")

		console.log("minted nft item", mintResult.itemId)
    */

		const sellAction = await sellerSdk.order.sell({
			// itemId: mintResult.itemId,
			itemId: toItemId("TEZOS:KT1F8GJBSYbCWf3vG4XbbuwTBZBu19TLLGzX:0"),
		})

		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.02",
			currency: {
				"@type": "XTZ",
			},
		})

		console.log("nft orderId", orderId)

		await awaitForOrder(sellerSdk, orderId)

		const fillAction = await buyerSdk.order.fill({
			// orderId,
			// orderId: toOrderId("TEZOS:4b1b0f60d9621436fd907a41fac329dfc7e149e2e3a980b5ea3fad6e72f5ecef"),
			orderId: toOrderId("TEZOS:2122505a5e0a7d2abbb433aac36a30f2ed97d6d05e102e53b85704f6cab61a19"),
		})

		console.log("before submit fill")
		const tx = await fillAction.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await tx.wait()
		console.log("fill", tx)

	}, 1500000)


	test.skip("sell MT test", async () => {
		/*
		const mintResponse = await sellerSdk.nft.mint({
			collectionId: toContractAddress(`TEZOS:${mtContract}`),
		})
		const mintResult = await mintResponse.submit({
			uri: "ipfs://bafkreiaz7n5zj2qvtwmqnahz7rwt5h37ywqu7znruiyhwuav3rbbxzert4",
			supply: 1,
			lazyMint: false,
		})
		if (mintResult.type === MintType.ON_CHAIN) {
			await mintResult.transaction.wait()
		}

		await retry(5, 500, async () => {
			await sellerSdk.apis.item.getItemById({
				itemId: mintResult.itemId,
			})
		})

		const sellAction = await sellerSdk.order.sell({
			itemId: mintResult.itemId,
		})

		const orderId = await sellAction.submit({
			amount: 10,
			price: "0.000002",
			currency: {
				"@type": "XTZ",
			},
		})

		console.log("mt orderId", orderId)


     */
		const fillAction = await buyerSdk.order.fill({
			orderId: toOrderId("TEZOS:4b1b0f60d9621436fd907a41fac329dfc7e149e2e3a980b5ea3fad6e72f5ecef"),
			// orderId: toOrderId("TEZOS:e29f422c1227076a417b5c78e87ab01eaecfe6f214b2b5fab4be961aa4e64a79"),
		})

		const tx = await fillAction.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await tx.wait()
		console.log("fill", tx)
	}, 2900000)

})
