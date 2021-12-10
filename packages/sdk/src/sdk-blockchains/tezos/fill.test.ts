import { toItemId, toOrderId } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { awaitForOwnership } from "./test/await-for-ownership"
import { createTestWallet } from "./test/test-wallet"

describe("fill test", () => {
	const wallet = createTestWallet(
		"edskS143x9JtTcFUxE5UDT9Tajkx9hdLha9mQhijSarwsKM6fzBEAuMEttFEjBYL7pT4o5P5yRqFGhUmqEynwviMk5KJ8iMgTw"
	)
	const buyerSdk = createRaribleSdk(wallet, "dev")

	test("fill NFT test", async () => {
		const buyerAddress = await wallet.provider.address()
		const fillAction = await buyerSdk.order.fill({
			orderId: toOrderId("TEZOS:031a378342384a8c79b83e540c2ff90628239d303bdb5afee980a24c1406ded3"),
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

	test.skip("fill MT test", async () => {
		const buyerAddress = await wallet.provider.address()
		console.log(buyerAddress)

		const fillAction = await buyerSdk.order.fill({
			orderId: toOrderId("TEZOS:1466064e295a6644ec348f5eea7da3b40f7785f2dd53c18e8e967a83d886f2e1"),
		})

		const tx = await fillAction.submit({
			amount: 1,
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
