import { toContractAddress, toCurrencyId, toUnionAddress } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import BigNumber from "bignumber.js"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { delay } from "../../common/retry"
import { createTestWallet } from "./test/test-wallet"
import { convertTezosToContractAddress, convertTezosToUnionAddress } from "./common"

describe.skip("get balance", () => {
	const sellerWallet = createTestWallet(
		"edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1" +
    "D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
	)
	const sellerSdk = createRaribleSdk(sellerWallet, "development", { logs: LogsLevel.DISABLED })

	test("get balance XTZ", async () => {
		const balance = await sellerSdk.balances.getBalance(
			toUnionAddress("TEZOS:tz1gqL7i1s578qj3NzgKmu6C5j3RdSBewGBo"),
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

	test.skip("get balance XTZ without wallet with CurrencyId", async () => {
		const sellerSdk = createRaribleSdk(undefined, "dev", { logs: LogsLevel.DISABLED })
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
				contract: toContractAddress("TEZOS:KT1LJSq4mhyLtPKrncLXerwAF2Xvk7eU3KJX"),
			}
		)
		expect(balance.toString()).toEqual("0.03")
	})

	test.skip("get balance FT", async () => {
		const balance = await sellerSdk.balances.getBalance(
			toUnionAddress("TEZOS:tz1hnh8ET6dtP2PBQ2yj2T3ZEfMii6kEWR6N"),
			toCurrencyId("TEZOS:KT1LJSq4mhyLtPKrncLXerwAF2Xvk7eU3KJX")
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

	test.skip("convert from XTZ to wTez", async () => {
		const senderRaw = await sellerWallet.provider.address()
		const wethE2eAssetType: AssetType = {
			"@type": "TEZOS_FT",
			contract: convertTezosToContractAddress("KT1RggVJ1mMaLJezpdsJ6YtBfL7sBfcaGD1H"),
		}
		const sender = convertTezosToUnionAddress(senderRaw)
		const initWethBalance = await sellerSdk.balances.getBalance(sender, wethE2eAssetType)
		const convertTx = await sellerSdk.balances.convert({
			blockchain: Blockchain.TEZOS,
			isWrap: true,
			value: "0.000035",
		})
		await convertTx.wait()

		await delay(2000)
		const finishWethBalance = await sellerSdk.balances.getBalance(sender, wethE2eAssetType)

		expect(finishWethBalance.toString()).toBe(
			new BigNumber(initWethBalance).plus("0.000035").toString()
		)
	})

	test.skip("convert from wTez to XTZ", async () => {
		const senderRaw = await sellerWallet.provider.address()
		const wethE2eAssetType: AssetType = {
			"@type": "TEZOS_FT",
			contract: convertTezosToContractAddress("KT1RggVJ1mMaLJezpdsJ6YtBfL7sBfcaGD1H"),
		}
		const sender = convertTezosToUnionAddress(senderRaw)
		const prepareConvertTx = await sellerSdk.balances.convert({
			blockchain: Blockchain.TEZOS,
			isWrap: true,
			value: "0.000071",
		})
		await prepareConvertTx.wait()

		await delay(2000)
		const initWethBalance = await sellerSdk.balances.getBalance(sender, wethE2eAssetType)
		const convertTx = await sellerSdk.balances.convert({
			blockchain: Blockchain.TEZOS,
			isWrap: false,
			value: "0.000039",
		})
		await convertTx.wait()

		await delay(2000)

		const finishWethBalance = await sellerSdk.balances.getBalance(sender, wethE2eAssetType)

		expect(finishWethBalance.toString()).toBe(
			new BigNumber(initWethBalance).minus("0.000039").toString()
		)
	})
})
