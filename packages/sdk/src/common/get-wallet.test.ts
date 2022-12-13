import { getRaribleWallet } from "./get-wallet"

describe("test signPersonalMessage", () => {

	test("ethereum signPersonalMessage", async () => {
		let a = await getRaribleWallet({
			"provider": 1,
			"signMessage": 1,
			"signTransaction": 1,
			"_isSigner": 1,
			"_signTypedData": 1,
		} as any)
		console.log(a)
	})
})
