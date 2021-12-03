import { toContractAddress, toItemId, toUnionAddress } from "@rarible/types"
import { canTransfer } from "./restriction"

describe("canTransfer", () => {
	test("returns false and reason for whitelisted collection", async () => {
		const me = toUnionAddress("TEZOS:tz1Vek4VpsDWDHrbi26gWT7GGcw7BvhE9DjQ")
		const otherMe = toUnionAddress("TEZOS:tz1V11fB4EX5VzPKMNQ1CsBKMSFS6fL3Br9W")
		const result = await canTransfer(toItemId("TEZOS:KT1SS9hdyQPxkaCzMmzm1Z37gmpgy81cSsXS:360001"), me, otherMe)
		expect(result).toStrictEqual({
			success: false,
			reason: "Ubisoft Quartz NFTs are only available to Ubisoft players.\n" +
				"Please read [Ubisoft Quartz’s FAQ](https://quartz.ubisoft.com/faq/) for more information.",
		})
	})

	test("returns true for whitelisted addresses", async () => {
		const from = toUnionAddress("TEZOS:tz1hHTdiDezgWNRWyY7RYSyZE11EobKQw583")
		const to = toUnionAddress("TEZOS:tz1dKxdpV1hgErMTTKBorb8R5tSz8hFzPhKh")
		const result = await canTransfer(toItemId("TEZOS:KT1SS9hdyQPxkaCzMmzm1Z37gmpgy81cSsXS:3600005"), from, to)
		expect(result).toStrictEqual({
			success: true,
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
