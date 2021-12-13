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
		const fillAction = await buyerSdk.order.buy({
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

	test("fill MT test", async () => {
		const buyerAddress = await wallet.provider.address()
		console.log(buyerAddress)

		const fillAction = await buyerSdk.order.buy({
			orderId: toOrderId("TEZOS:ce314586ee57e7bae423502503dcd28a76499ba0a1539a365550047801a81bfa"),
		})

		const tx = await fillAction.submit({
			amount: 8,
			infiniteApproval: true,
		})
		await tx.wait()

		const ownership = await awaitForOwnership(
			buyerSdk,
			toItemId("TEZOS:KT1WsCHc9NBDsWvVVVShCASrAuutNJA99tJD:3"),
			buyerAddress
		)
		expect(ownership.value).toBe("1")
	}, 1500000)

})
