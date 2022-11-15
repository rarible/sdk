import { hashIdentifier } from "./merkletree"

describe("merkletree test", () => {

	test("hashIdentifier #1", async () => {
		const hash = hashIdentifier("10000000000000000000000000000000000000000").toString("hex")
		expect(hash).toBe("aafdeca144e60d24b4ebfb7aca09bba4988f03e10b408716eb14a0cedd128cd9")
	})
	test("hashIdentifier #2", async () => {
		const hash = hashIdentifier("10").toString("hex")
		expect(hash).toBe("c65a7bb8d6351c1cf70c95a316cc6a92839c986682d98bc35f958f4883f9d2a8")
	})
})
