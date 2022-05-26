import { toContractAddress, toCurrencyId, toUnionAddress } from "@rarible/types"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { createTestWallet } from "./test/test-wallet"

describe("get balance", () => {
	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const sellerSdk = createRaribleSdk(sellerWallet, "staging", { logs: LogsLevel.DISABLED })

	//eur
	const fa2 = "TEZOS:KT1PEBh9oKkQosYuw4tvzigps5p7uqXMgdez"
	//uusd
	const fa12 = "TEZOS:KT1WsXMAzcre2MNUjNkGtVQLpsTnNFhBJhLv"

	test("get balance XTZ", async () => {
		const balance = await sellerSdk.balances.getBalance(
			toUnionAddress("TEZOS:tz1gqL7i1s578qj3NzgKmu6C5j3RdSBewGBo"),
			{ "@type": "XTZ" }
		)
		expect(balance.toString()).toEqual("1043.538791")
	})

	test("get balance XTZ without wallet", async () => {
		const sellerSdk = createRaribleSdk(undefined, "staging", { logs: LogsLevel.DISABLED })
		const balance = await sellerSdk.balances.getBalance(
			toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"),
			{ "@type": "XTZ" }
		)
		expect(balance.toString()).toEqual("1.0093")
	})

	test("get balance XTZ without wallet with CurrencyId", async () => {
		const sellerSdk = createRaribleSdk(undefined, "staging", { logs: LogsLevel.DISABLED })
		const balance = await sellerSdk.balances.getBalance(
			toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"),
			toCurrencyId("TEZOS:tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU")
		)
		expect(balance.toString()).toEqual("1.0093")
	})

	test("get balance FT", async () => {
		const balance = await sellerSdk.balances.getBalance(
			toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"),
			{
				"@type": "TEZOS_FT",
				contract: toContractAddress(fa12),
			}
		)
		expect(balance.toString()).toEqual("0.03")
	})

	test("get balance FT with currencyId", async () => {
		const balance = await sellerSdk.balances.getBalance(
			toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"),
			toCurrencyId(fa2)
		)
		expect(balance.toString()).toEqual("0.03")
	})

	test("get balance FT without wallet", async () => {
		const sellerSdk = createRaribleSdk(undefined, "staging", { logs: LogsLevel.DISABLED })
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
