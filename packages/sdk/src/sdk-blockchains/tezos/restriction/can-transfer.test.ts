import { toContractAddress, toItemId, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../../index"
import { createTestWallet } from "../test/test-wallet"

describe("canTransfer", () => {
	const wallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const sdk = createRaribleSdk(wallet, "dev")

	test("returns false and reason for whitelisted collection", async () => {
		const me = toUnionAddress("TEZOS:tz1Vek4VpsDWDHrbi26gWT7GGcw7BvhE9DjQ")
		const otherMe = toUnionAddress("TEZOS:tz1V11fB4EX5VzPKMNQ1CsBKMSFS6fL3Br9W")
		const result = await sdk.restriction.canTransfer(toItemId("TEZOS:KT1S3goQNhyuZgznN952Vwfqeo96YV3U4pwf:100005"), me, otherMe)
		expect(result).toStrictEqual({
			success: false,
			reason: "Ubisoft Quartz NFTs are only available to Ubisoft players.\n" +
				"Please read [Ubisoft Quartz’s FAQ](https://quartz.ubisoft.com/faq/) for more information.",
		})
	})

	test.skip("returns true for whitelisted addresses", async () => {
		const from = toUnionAddress("TEZOS:tz1NRh1vTn3b38m7Gg2qP81dqb5Kr2BAjwJV")
		const to = toUnionAddress("TEZOS:tz1Vek4VpsDWDHrbi26gWT7GGcw7BvhE9DjQ")
		const result = await sdk.restriction.canTransfer(toItemId("TEZOS:KT1S3goQNhyuZgznN952Vwfqeo96YV3U4pwf:100002"), from, to)
		expect(result).toStrictEqual({
			success: true,
		})
	})

	test.skip("returns true for other collection", async () => {
		const token = toContractAddress("TEZOS:KT1GXE3DGqyxTsrh6mHkfPtd9TFoGnK8vDv9")
		const me = toUnionAddress("TEZOS:tz1Vek4VpsDWDHrbi26gWT7GGcw7BvhE9DjQ")
		const otherMe = toUnionAddress("TEZOS:tz1V11fB4EX5VzPKMNQ1CsBKMSFS6fL3Br9W")
		const result = await sdk.restriction.canTransfer(toItemId(`${token}:1`), me, otherMe)
		expect(result).toStrictEqual({
			success: true,
		})
	})
})
