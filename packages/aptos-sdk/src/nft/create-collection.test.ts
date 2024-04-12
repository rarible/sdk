import { createTestAptosState } from "../common/test"
import { AptosDeploy } from "./create-collection"
describe("create collection", () => {
	const { aptos, account } = createTestAptosState()
	const deploy = new AptosDeploy(aptos, account)

	test("create collection", async () => {
		const uri = "ipfs://QmWYpMyoaUGNRSQbwhw97xM8tcRWm4Et598qtzmzsau7ch/"
		const randomId = Math.floor(Math.random() * 100_000_000)

		const tx = await deploy.createCollection(
			`Test collection #${randomId}`,
			"ASD",
			uri
		)
		console.log("Collection created", JSON.stringify(tx, null, "  "))
	})
})
