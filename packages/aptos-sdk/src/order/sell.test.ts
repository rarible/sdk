import { AptosGenericSdkWallet } from "@rarible/aptos-wallet"
import { createTestAptosState, mintTestToken } from "../common/test"
import { AptosOrder } from "./index"

describe.skip("sell nft", () => {
	const { aptos, account } = createTestAptosState()
	const wallet = new AptosGenericSdkWallet(aptos, account)
	const orderClass = new AptosOrder(aptos, wallet)

	test("sell", async () => {
		const testTokenAddress = await mintTestToken(aptos, account)

		const feeAddress = "0x72156c210460e9d1ee90eac2ba5c654f6fda9a7dc60f64e41471291a9110392e"
		const startTime = Math.floor(Date.now() / 1000)
		const price = "2000000"

		const tx = await orderClass.sell(
			testTokenAddress,
			feeAddress,
			startTime,
			price
		)
		console.log("tx", JSON.stringify(tx, null, "  "))
	})

	test("cancel sell order", async () => {
		const testTokenAddress = await mintTestToken(aptos, account)

		console.log("testTokenAddress", testTokenAddress)
		const feeAddress = "0x72156c210460e9d1ee90eac2ba5c654f6fda9a7dc60f64e41471291a9110392e"
		const startTime = Math.floor(Date.now() / 1000)
		const price = "2000000"

		const tx = await orderClass.sell(
			testTokenAddress,
			feeAddress,
			startTime,
			price
		)
		console.log("tx", JSON.stringify(tx, null, "  "))
		// orderClass.cancel(tx)
	})


})
