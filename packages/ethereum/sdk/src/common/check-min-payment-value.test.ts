import type { Address } from "@rarible/types"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toAddress } from "@rarible/types"
import type { EthOrderFormAsset } from "@rarible/api-client/build/models/EthOrderFormAsset"
import { devEthereumConfig } from "../config/dev"
import { checkGreaterThanMinPaymentValue, checkMinPaymentValue } from "./check-min-payment-value"

describe("check min payment value fn", function () {
	const config = devEthereumConfig
	const enoughEthAsset: EthOrderFormAsset = {
		assetType: {
			"@type": "ETH",
		},
		value: toBigNumber("100000000000000"),
	}
	const notEnoughEthAsset: EthOrderFormAsset = {
		assetType: {
			"@type": "ETH",
		},
		value: toBigNumber("10"),
	}
	const erc721Asset: EthOrderFormAsset = {
		assetType: {
			"@type": "ERC721",
			contract: toAddress("0x0000000000000000000000000000000000000001"),
			tokenId: toBigNumber("1"),
		},
		value: toBigNumber("1"),
	}

	test("checkGreaterThanMinPaymentValue throws error with rari token", async () => {
		let err: any
		try {
			const rariAsset: EthOrderFormAsset = {
				assetType: {
					"@type": "ERC20",
					contract: config.rari as Address,
				},
				value: toBigNumber("10"),
			}
			checkGreaterThanMinPaymentValue(rariAsset, config)
		} catch (e) {
			err = e
		}
		expect(err?.message.startsWith("Asset value must be less or equal to")).toBeTruthy()
	})

	test("checkGreaterThanMinPaymentValue throws error with weth token", async () => {
		let err: any
		try {
			const wethAsset: EthOrderFormAsset = {
				assetType: {
					"@type": "ERC20",
					contract: config.weth as Address,
				},
				value: toBigNumber("10"),
			}
			checkGreaterThanMinPaymentValue(wethAsset, config)
		} catch (e) {
			err = e
		}
		expect(err?.message.startsWith("Asset value must be less or equal to")).toBeTruthy()
	})

	test("checkGreaterThanMinPaymentValue throws error with ETH", async () => {
		let err: any
		try {
			checkGreaterThanMinPaymentValue(notEnoughEthAsset, config)
		} catch (e) {
			err = e
		}
		expect(err?.message.startsWith("Asset value must be less or equal to")).toBeTruthy()
	})

	test("checkGreaterThanMinPaymentValue returns undefined with 0.0001 ETH", async () => {
		checkGreaterThanMinPaymentValue(enoughEthAsset, config)
	})

	test("checkMinPaymentValue returns undefined if sell order has been passed", async () => {
		checkMinPaymentValue({
			make: erc721Asset,
			take: enoughEthAsset,
		} as any, config)
	})

	test("checkMinPaymentValue returns undefined if bid order has been passed", async () => {
		checkMinPaymentValue({
			make: enoughEthAsset,
			take: erc721Asset,
		} as any, config)
	})

	test("checkMinPaymentValue throws error if sell order has been passed", async () => {
		let err: any
		try {
			checkMinPaymentValue({
				make: erc721Asset,
				take: notEnoughEthAsset,
			} as any, config)
		} catch (e) {
			err = e
		}
		expect(err?.message.startsWith("Asset value must be less or equal to")).toBeTruthy()

	})

	test("checkMinPaymentValue throws error if bid order has been passed", async () => {
		let err: any
		try {
			checkMinPaymentValue({
				make: notEnoughEthAsset,
				take: erc721Asset,
			} as any, config)
		} catch (e) {
			err = e
		}
		expect(err?.message.startsWith("Asset value must be less or equal to")).toBeTruthy()

	})
})
