import type { Asset, Erc721AssetType } from "@rarible/ethereum-api-client"
import { toBigNumber } from "@rarible/types/build/big-number"
import { getEthereumConfig } from "../../config"
import { ETHER_IN_WEI } from ".."
import { createE2EProviderEmpty } from "../test/provider"
import { createTestAdapters } from "../test/provider-adapters"
import { getPublicNftContract } from "../test/contracts"
import { ERC721VersionEnum } from "../../nft/contracts/domain"
import { MIN_PAYMENT_VALUE, checkGreaterThanMinPaymentValue, checkMinPaymentValue } from "./index"

describe("checkMinPaymentValue", () => {
	const network = "dev-ethereum" as const
	const { provider, wallet } = createE2EProviderEmpty(network)
	const adapters = createTestAdapters(provider, wallet)
	const config = getEthereumConfig(network)

	const fungibleAssets = [
		{ label: "ETH", asset: { assetClass: "ETH" } },
		{ label: "WETH", asset: { assetClass: "ERC20", contract: config.weth } },
	] as const

	describe("checkGreaterThanMinPaymentValue", () => {
		test.each(fungibleAssets)("throws error with $label token", async ({ asset }) => {
			const price = MIN_PAYMENT_VALUE.multipliedBy(ETHER_IN_WEI).minus(1)
			const wethAsset: Asset = {
				assetType: asset,
				value: toBigNumber(price.toString()),
			}
			await expect(() => checkGreaterThanMinPaymentValue(adapters.web3, wethAsset))
				.rejects
				.toThrowError(/asset value must be greater or equal to/i)
		})

		test.each(fungibleAssets)("bypasses error with $label token", async ({ asset }) => {
			const price = MIN_PAYMENT_VALUE.multipliedBy(ETHER_IN_WEI).plus(1)
			const wethAsset: Asset = {
				assetType: asset,
				value: toBigNumber(price.toString()),
			}

			const result = await checkGreaterThanMinPaymentValue(adapters.web3, wethAsset)
			expect(result).toBe(undefined)
		})
	})

	describe("checkMinPaymentValue", () => {
		const erc721Contract = getPublicNftContract(network, ERC721VersionEnum.ERC721V3)
		const erc721Asset: Erc721AssetType = {
			assetClass: "ERC721",
			contract: erc721Contract,
			tokenId: toBigNumber("42"),
		}

		test.each(fungibleAssets)("returns undefined with $label on the take side", async ({ asset }) => {
			const price = MIN_PAYMENT_VALUE.multipliedBy(ETHER_IN_WEI).plus(1)
			await checkMinPaymentValue(adapters.web3, {
				make: {
					assetType: erc721Asset,
					value: toBigNumber("1"),
				},
				take: {
					assetType: asset,
					value: toBigNumber(price.toString()),
				},
			})
		})

		test.each(fungibleAssets)("throws error with $label on the take side", async ({ asset }) => {
			const price = MIN_PAYMENT_VALUE.multipliedBy(ETHER_IN_WEI).minus(1)
			await expect(() => checkMinPaymentValue(adapters.web3, {
				make: {
					assetType: erc721Asset,
					value: toBigNumber("1"),
				},
				take: {
					assetType: asset,
					value: toBigNumber(price.toString()),
				},
			}))
				.rejects
				.toThrowError(/asset value must be greater or equal to/i)
		})

		test.each(fungibleAssets)("returns undefined with $label on the make side", async ({ asset }) => {
			const price = MIN_PAYMENT_VALUE.multipliedBy(ETHER_IN_WEI).plus(1)
			await checkMinPaymentValue(adapters.web3, {
				take: {
					assetType: erc721Asset,
					value: toBigNumber("1"),
				},
				make: {
					assetType: asset,
					value: toBigNumber(price.toString()),
				},
			})
		})

		test.each(fungibleAssets)("throws error with $label on the make side", async ({ asset }) => {
			const price = MIN_PAYMENT_VALUE.multipliedBy(ETHER_IN_WEI).minus(1)
			await expect(() => checkMinPaymentValue(adapters.web3, {
				take: {
					assetType: erc721Asset,
					value: toBigNumber("1"),
				},
				make: {
					assetType: asset,
					value: toBigNumber(price.toString()),
				},
			}))
				.rejects
				.toThrowError(/asset value must be greater or equal to/i)
		})
	})
})
