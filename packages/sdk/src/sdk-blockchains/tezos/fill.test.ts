import { toItemId } from "@rarible/types"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import type { RaribleSdkEnvironment } from "../../config/domain"
import { awaitForOwnership } from "./test/await-for-ownership"
import { createTestWallet } from "./test/test-wallet"
import { convertTezosItemId, convertTezosOrderId } from "./common"

describe.skip("fill test", () => {
	const env: RaribleSdkEnvironment = "testnet"
	const wallet = createTestWallet(
		"edskS4QxJFDSkHaf6Ax3ByfrZj5cKvLUR813uqwE94baan31c1cPPTMvoAvUKbEv2xM9mvtwoLANNTBSdyZf3CCyN2re7qZyi3",
		env
	)
	const it = awaitAll({
		buyerSdk: createRaribleSdk(wallet, env, { logs: LogsLevel.DISABLED }),
	})

	test("buy NFT test", async () => {
		const buyerAddress = await wallet.provider.address()
		const fillAction = await it.buyerSdk.order.buy.prepare({
			orderId: convertTezosOrderId("755dcfce-ead2-5a22-be41-da338656ff9b"),
		})

		const tx = await fillAction.submit({
			amount: 1,
			infiniteApproval: true,
		})
		console.log("tx", tx)
		await tx.wait()

		const ownership = await awaitForOwnership(
			it.buyerSdk,
			toItemId("TEZOS:KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS:46284"),
			buyerAddress
		)
		expect(ownership.value).toBe("1")
	}, 1500000)

	test.skip("buy MT test", async () => {
		const buyerAddress = await wallet.provider.address()

		const fillAction = await it.buyerSdk.order.buy.prepare({
			orderId: convertTezosOrderId("f1a87424bc67e47a9a3f850b9f5a5ba13af5259f6d139d7b3710b4862a3aaac9"),
		})

		const tx = await fillAction.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await tx.wait()

		const ownership = await awaitForOwnership(
			it.buyerSdk,
			convertTezosItemId("KT1Ctz9vuC6uxsBPD4GbdbPaJvZogWhE9SLu:50"),
			buyerAddress
		)
		expect(ownership.value).toBe("1")
	}, 1500000)

})
