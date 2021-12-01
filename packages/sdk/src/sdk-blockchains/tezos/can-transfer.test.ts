import { toContractAddress, toItemId, toUnionAddress } from "@rarible/types"
import { canTransfer } from "./index"

describe("canTransfer", () => {
	test("returns false and reason for whitelisted collection", async () => {
		const token = toContractAddress("TEZOS:KT1SS9hdyQPxkaCzMmzm1Z37gmpgy81cSsXS")
		const me = toUnionAddress("TEZOS:tz1Vek4VpsDWDHrbi26gWT7GGcw7BvhE9DjQ")
		const otherMe = toUnionAddress("TEZOS:tz1V11fB4EX5VzPKMNQ1CsBKMSFS6fL3Br9W")
		const result = await canTransfer(toItemId(`${token}:360001`), me, otherMe)
		expect(result).toStrictEqual({
			success: false,
			reason: "Ubisoft Quartz NFTs are only available to Ubisoft players.\n" +
				"Please read [Ubisoft Quartz’s FAQ](https://quartz.ubisoft.com/faq/) for more information.",
		})
	})

	test.skip("returns true for other collection", async () => {
		const token = toContractAddress("TEZOS:KT1GXE3DGqyxTsrh6mHkfPtd9TFoGnK8vDv9")
		const me = toUnionAddress("TEZOS:tz1Vek4VpsDWDHrbi26gWT7GGcw7BvhE9DjQ")
		const otherMe = toUnionAddress("TEZOS:tz1V11fB4EX5VzPKMNQ1CsBKMSFS6fL3Br9W")
		const result = await canTransfer(toItemId(`${token}:1`), me, otherMe)
		expect(result).toStrictEqual({
			success: true,
		})
	})
})
