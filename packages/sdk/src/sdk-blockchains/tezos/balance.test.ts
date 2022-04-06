import { toContractAddress, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { createTestWallet } from "./test/test-wallet"

describe("get balance", () => {
	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const sellerSdk = createRaribleSdk(sellerWallet, "dev", { logs: LogsLevel.DISABLED })

	test.skip("get balance XTZ", async () => {
		const balance = await sellerSdk.balances.getBalance(
			toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"),
			{ "@type": "XTZ" }
		)
		expect(balance.toString()).toEqual("1.0093")
	})

	test.skip("get balance XTZ without wallet", async () => {
		const sellerSdk = createRaribleSdk(undefined, "dev", { logs: LogsLevel.DISABLED })
		const balance = await sellerSdk.balances.getBalance(
			toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"),
			{ "@type": "XTZ" }
		)
		expect(balance.toString()).toEqual("1.0093")
	})

	test.skip("get balance FT", async () => {
		const balance = await sellerSdk.balances.getBalance(
			toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"),
			{
				"@type": "TEZOS_FT",
				contract: toContractAddress("TEZOS:KT1LJSq4mhyLtPKrncLXerwAF2Xvk7eU3KJX"),
			}
		)
		expect(balance.toString()).toEqual("0.03")
	})

	test.skip("get balance FT without wallet", async () => {
		const sellerSdk = createRaribleSdk(undefined, "dev", { logs: LogsLevel.DISABLED })
		const balance = await sellerSdk.balances.getBalance(
			toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"),
			{
				"@type": "TEZOS_FT",
				contract: toContractAddress("TEZOS:KT1LJSq4mhyLtPKrncLXerwAF2Xvk7eU3KJX"),
			}
		)
		expect(balance.toString()).toEqual("0.03")
	})
})
