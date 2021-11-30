// eslint-disable-next-line camelcase
import { in_memory_provider } from "tezos-sdk-module/dist/providers/in_memory/in_memory_provider"
import { TezosWallet } from "@rarible/sdk-wallet"
import { toItemId, toOrderId } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { awaitForOwnership } from "./test/await-for-ownership"
import { createTestWallet } from "./test/test-wallet"

describe("fill test", () => {
	const wallet = createTestWallet(
		"edskS143x9JtTcFUxE5UDT9Tajkx9hdLha9mQhijSarwsKM6fzBEAuMEttFEjBYL7pT4o5P5yRqFGhUmqEynwviMk5KJ8iMgTw"
	)
	const buyerSdk = createRaribleSdk(wallet, "dev")

	test.skip("fill NFT test", async () => {
		const buyerAddress = await wallet.provider.address()
		const fillAction = await buyerSdk.order.fill({
			orderId: toOrderId("TEZOS:5f3465e176339b6932669c87cd137caad6658e555c5a108318b4f0453045b777"),
		})

		const tx = await fillAction.submit({
			amount: 1,
			infiniteApproval: true,
		})
		await tx.wait()

		const ownership = await awaitForOwnership(
			buyerSdk,
			toItemId("TEZOS:KT1DK9ArYc2QVgqr4jz46WnWt5g9zsE3Cifb:13"),
			buyerAddress
		)
		expect(ownership.value).toBe("1")
	}, 1500000)

	test.skip("fill MT test", async () => {
		const buyerAddress = await wallet.provider.address()

		const fillAction = await buyerSdk.order.fill({
			orderId: toOrderId("TEZOS:c25b2f149f19241e158703c5f75254bd53e7039a4363382db0c312ef857a6ea6"),
		})

		const tx = await fillAction.submit({
			amount: 2,
			infiniteApproval: true,
		})
		await tx.wait()

		const ownership = await awaitForOwnership(
			buyerSdk,
			toItemId("TEZOS:KT18vSGouhJcJZDDgrbBKkdCBjSXJWSbui3i:5"),
			buyerAddress
		)
		expect(ownership.value).toBe("2")
	}, 1500000)

})
