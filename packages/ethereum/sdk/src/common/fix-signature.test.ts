import { fixSignature } from "./fix-signature"

/**
 * @group type/common
 */
describe("fixSignature", () => {
	test("should change 01 -> 1c", () => {
		expect(fixSignature("0x2861b4064ab010b578a5c5bf842cd6ad18dabbcc8f4ee4f412418f4fd57aae280e2d2a2ea91a596b93a5e3e422944771bc975fbb40bb10e7c226398e43bcdb7a01"))
			.toBe("0x2861b4064ab010b578a5c5bf842cd6ad18dabbcc8f4ee4f412418f4fd57aae280e2d2a2ea91a596b93a5e3e422944771bc975fbb40bb10e7c226398e43bcdb7a1c")
	})
})
