import { createTestAptosState } from "../common/test"
import { AptosMint } from "./mint"

describe("mint nft", () => {
	const { aptos, account } = createTestAptosState()
	const mintClass = new AptosMint(aptos, account)

	test("mint", async () => {
		const uri = "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/"
		const tx = await mintClass.mint(
			"Test collection #367956",
			"Mytoken #4",
			"Description of Mytoken #4",
			uri
		)
		console.log("tx", JSON.stringify(tx, null, "  "))
	})

})
