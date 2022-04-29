import { toPublicKey } from "@rarible/solana-common"
import { SolanaSdk } from "../sdk/sdk"

describe("solana sdk balance", () => {
	const sdk = SolanaSdk.create({ connection: { cluster: "devnet" }, debug: true })

	test("Should check account balance", async () => {
		const balance = await sdk.balances.getBalance(toPublicKey("2XyukL1KvwDkfNcdBpfXbj6UtPqF7zcUdTDURNjLFAMo"))
		expect(parseFloat(balance.toString())).toBeGreaterThan(0)
	})

	test("Should check NFT balance", async () => {
		const mint = toPublicKey("6APnUDJXkTAbT5tpKr3WeMGQ74p1QcXZjLR6erpnLM8P")

		const balance = await sdk.balances.getTokenBalance(toPublicKey("2XyukL1KvwDkfNcdBpfXbj6UtPqF7zcUdTDURNjLFAMo"), mint)
		expect(parseFloat(balance.toString())).toBeGreaterThanOrEqual(1)
	})
})