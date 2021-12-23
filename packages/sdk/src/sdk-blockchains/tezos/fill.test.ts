import { toItemId } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { awaitForOwnership } from "./test/await-for-ownership"
import { createTestWallet } from "./test/test-wallet"
import { convertTezosItemId, convertTezosOrderId } from "./common"

describe("fill test", () => {
	const wallet = createTestWallet(
		"edskS4QxJFDSkHaf6Ax3ByfrZj5cKvLUR813uqwE94baan31c1cPPTMvoAvUKbEv2xM9mvtwoLANNTBSdyZf3CCyN2re7qZyi3"
	)
	const buyerSdk = createRaribleSdk(wallet, "dev")

	test.skip("buy NFT test", async () => {
		const buyerAddress = await wallet.provider.address()
		const fillAction = await buyerSdk.order.buy({
			orderId: convertTezosOrderId("031a378342384a8c79b83e540c2ff90628239d303bdb5afee980a24c1406ded3"),
		})

		const tx = await fillAction.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await tx.wait()

		const ownership = await awaitForOwnership(
			buyerSdk,
			toItemId("TEZOS:KT1EWB3JaMmZ5BmNqHVBjB4re62FLihp4G6C:7"),
			buyerAddress
		)
		expect(ownership.value).toBe("1")
	}, 1500000)

	test.skip("buy MT test", async () => {
		const buyerAddress = await wallet.provider.address()
		console.log(buyerAddress)

		//b0e7e874ddcbf5a2704a299794f57c2886798005ff86b3c7ed12c89c1d6b8b6c
		const fillAction = await buyerSdk.order.buy({
			orderId: convertTezosOrderId("f1a87424bc67e47a9a3f850b9f5a5ba13af5259f6d139d7b3710b4862a3aaac9"),
		})

		const tx = await fillAction.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await tx.wait()

		console.log("tx", tx)
		const ownership = await awaitForOwnership(
			buyerSdk,
			convertTezosItemId("KT1Ctz9vuC6uxsBPD4GbdbPaJvZogWhE9SLu:50"),
			buyerAddress
		)
		expect(ownership.value).toBe("1")
	}, 1500000)

})
