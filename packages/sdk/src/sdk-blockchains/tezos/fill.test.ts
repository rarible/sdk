// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toOrderId } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { createTestInMemoryProvider } from "./test/create-in-memory-provider"

describe("fill test", () => {
	const tezos = createTestInMemoryProvider("edsk3UUamwmemNBJgDvS8jXCgKsvjL2NoTwYRFpGSRPut4Hmfs6dG8")
	const wallet = new TezosWallet(tezos)
	const sdk = createRaribleSdk(wallet, "dev")

	let nftContract: string = "KT1LsNPSjhoBC4gzgLGA8HpHYMN9tZmCiS8F"
	let mtContract: string = "KT1CVupWRCmVMPPJpUxLWaM6g1V6meKU5EeG"

	test("fill NFT test", async () => {
		console.log(await tezos.address())
		// return
		const fillAction = await sdk.order.fill({
			// itemId: mintResult.itemId,
			orderId: toOrderId("TEZOS:e0a0b8ad0c96c8262d639f315fd52576e90121b2abbf46d805dda3b5adaa938d"),
		})

		const tx = await fillAction.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await tx.wait()

	}, 1500000)

	test.skip("fill MT test", async () => {
		const fillAction = await sdk.order.fill({
			// itemId: mintResult.itemId,
			orderId: toOrderId("TEZOS:2c6980581414bc595efa1baa8cd5c1b0725238f90f1acbe43f9a439c08a94e8b"),
		})

		const tx = await fillAction.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await tx.wait()

	}, 1500000)

})
