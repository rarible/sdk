// eslint-disable-next-line camelcase
import { toBigNumber, toCollectionId } from "@rarible/types"
import type { TezosNetwork } from "@rarible/tezos-sdk"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import { createApisSdk } from "../../common/apis"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { getSdkConfig } from "../../config"
import { awaitForItemSupply } from "./test/await-for-item-supply"
import { createTestWallet } from "./test/test-wallet"
import { getMaybeTezosProvider, getTezosAPIs } from "./common"
import { TezosSell } from "./sell"
import { getTestContract } from "./test/test-contracts"

describe.skip("cancel test", () => {
	const env: RaribleSdkEnvironment = "staging"
	const tezosNetwork: TezosNetwork = getSdkConfig(env).tezosNetwork
	const wallet = createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8", env)
	const sdk = createRaribleSdk(wallet, env, { logs: LogsLevel.DISABLED })

	const sellerTezosProvider = getMaybeTezosProvider(wallet.provider, tezosNetwork)
	const apis = getTezosAPIs(tezosNetwork)
	const unionApis = createApisSdk(env, undefined)
	const sellerSellService = new TezosSell(sellerTezosProvider, apis, unionApis)

	const nftContract: string = getTestContract(env, "nftContract")
	const eurTzContract = getTestContract(env, "eurTzContract")

	test("cancel order", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toCollectionId(nftContract),
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

		const sellAction = await sdk.order.sell({
			itemId: mintResult.itemId,
		})

		const orderId = await sellAction.submit({
			amount: 1,
			price: "0.000001",
			currency: {
				"@type": "XTZ",
			},
		})

		await retry(10, 1000, async () => {
			const order = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (order.status !== "ACTIVE") {
				throw new Error("Order status is not active")
			}
		})

		// await delay(5000)
		const cancelTx = await sdk.order.cancel({
			orderId,
		})
		await cancelTx.wait()
		await retry(10, 1000, async () => {
			const canceledOrder = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (canceledOrder.status !== "CANCELLED") {
				throw new Error("Order has not been cancelled")
			}
		})


	}, 1500000)

	test("cancel v1 order", async () => {
		const mintResponse = await sdk.nft.mint({
			collectionId: toCollectionId(nftContract),
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

		const orderId = await sellerSellService.sellV1({
			itemId: mintResult.itemId,
			amount: 1,
			price: "0.002",
			currency: {
				"@type": "TEZOS_FT",
				contract: eurTzContract,
				tokenId: toBigNumber("0"),
			},
		})

		await retry(10, 1000, async () => {
			const order = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (order.status !== "ACTIVE") {
				throw new Error("Order status is not active")
			}
		})

		// await delay(5000)
		const cancelTx = await sdk.order.cancel({
			orderId,
		})
		await cancelTx.wait()
		await retry(10, 1000, async () => {
			const canceledOrder = await sdk.apis.order.getOrderById({
				id: orderId,
			})
			if (canceledOrder.status !== "CANCELLED") {
				throw new Error("Order has not been cancelled")
			}
		})


	}, 1500000)
})
