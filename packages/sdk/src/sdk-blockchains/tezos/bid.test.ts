import { toBigNumber, toContractAddress, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { createTestWallet } from "./test/test-wallet"
import { awaitForItemSupply } from "./test/await-for-item-supply"
import { awaitForOrder } from "./test/await-for-order"

describe("bid test", () => {
	const wallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj")

	const sdk = createRaribleSdk(wallet, "dev")

	const eurTzContract = "KT1Rgf9RNW7gLj7JGn98yyVM34S4St9eudMC"
	const nftContract: string = "KT1Ctz9vuC6uxsBPD4GbdbPaJvZogWhE9SLu"

	test("bid test", async () => {
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
				"@type": "TEZOS_FT",
				contract: toContractAddress(
					`TEZOS:${eurTzContract}`
				),
				tokenId: toBigNumber("0"),
			},
			payouts: [{
				account: toUnionAddress(`TEZOS:${sellerAddress}`),
				value: 100,
			}],
		})

		await awaitForOrder(sdk, orderId)
	}, 1500000)

})
