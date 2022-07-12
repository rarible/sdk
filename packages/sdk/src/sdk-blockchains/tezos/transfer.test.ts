import { toBigNumber, toCollectionId, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { MintType } from "../../types/nft/mint/domain"
import { LogsLevel } from "../../domain"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { awaitItemSupply } from "../ethereum/test/await-item-supply"
import { createTestWallet } from "./test/test-wallet"
import { awaitForOwnership } from "./test/await-for-ownership"
import { getTestContract } from "./test/test-contracts"

describe.skip("transfer test", () => {
	const env: RaribleSdkEnvironment = "development"
	const wallet = createTestWallet("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8", env)
	const sdk = createRaribleSdk(wallet, env, { logs: LogsLevel.DISABLED })

	const recipient = "tz1VXxRfyFHoPXBVUrWY5tsa1oWevrgChhSg"
	const nftContract: string = getTestContract(env, "nftContract")
	const mtContract: string = getTestContract(env, "mtContract")

	test("transfer NFT test", async () => {
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

		await awaitItemSupply(sdk, mintResult.itemId, toBigNumber("1"))

		const transfer = await sdk.nft.transfer({
			itemId: mintResult.itemId,
		})

		const result = await transfer.submit({
			to: toUnionAddress(`TEZOS:${recipient}`),
			amount: 1,
		})

		await result.wait()

		await awaitForOwnership(sdk, mintResult.itemId, recipient)
	}, 1500000)

	test("transfer MT test", async () => {

		const mintResponse = await sdk.nft.mint({
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
		await awaitItemSupply(sdk, mintResult.itemId, toBigNumber("10"))

		const transfer = await sdk.nft.transfer({
			itemId: mintResult.itemId,
		})
		const result = await transfer.submit({
			to: toUnionAddress(`TEZOS:${recipient}`),
			amount: 5,
		})
		await result.wait()

		await awaitForOwnership(sdk, mintResult.itemId, recipient)

	}, 1500000)

})
