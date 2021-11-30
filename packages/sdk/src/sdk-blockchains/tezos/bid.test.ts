// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { toContractAddress, toUnionAddress } from "@rarible/types"
import { TezosWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { retry } from "../../common/retry"
import { createTestWallet } from "./test/test-wallet"
import { awaitForItemSupply } from "./test/await-for-item-supply"
import { awaitForOrder } from "./test/await-for-order"

describe("bid test", () => {
	const wallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj")

	const sdk = createRaribleSdk(wallet, "dev")

	const nftContract: string = "KT1DK9ArYc2QVgqr4jz46WnWt5g9zsE3Cifb"

	test.skip("bid test", async () => {
		const sellerAddress = await wallet.provider.address()
		const mintResponse = await sdk.nft.mint({
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

		await awaitForItemSupply(sdk, mintResult.itemId, "1")

		const bidResponse = await sdk.order.bid({ itemId: mintResult.itemId })
		const orderId = await bidResponse.submit({
			amount: 1,
			price: "0.000002",
			currency: {
				"@type": "XTZ",
			},
			payouts: [{
				account: toUnionAddress(`TEZOS:${sellerAddress}`),
				value: 10000,
			}],
		})

		await awaitForOrder(sdk, orderId)
	}, 1500000)

})
