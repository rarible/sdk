import { toAddress, toBigNumber, ZERO_WORD } from "@rarible/types"
import type { Address, BigNumber, Erc1155AssetType, Erc20AssetType, Erc721AssetType, EthAssetType, OrderForm, Part } from "@rarible/ethereum-api-client"
import { createE2eProvider, deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import { toBn } from "@rarible/utils"
import type { Ethereum } from "@rarible/ethereum-provider"
import { getEthereumConfig } from "../../config"
import { createTestAdapters } from "../../common/test/create-test-providers"
import { getApis as getApisTemplate } from "../../common/apis"
import { getSimpleSendWithInjects } from "../../common/send-transaction"
import { signNft as signNftTemplate } from "../../nft/sign-nft"
import type { MintRequest } from "../../nft/mint"
import { MintResponseTypeEnum, mint as mintTemplate } from "../../nft/mint"
import type { TestContractsNetwork, TestContractType } from "../../common/test/test-credentials"
import { DEV_PK_1, getE2EConfigByNetwork, getTestContract } from "../../common/test/test-credentials"
import { createErc1155V2Collection, createErc721V3Collection } from "../../common/mint"
import { MIN_PAYMENT_VALUE } from "../../common/check-min-payment-value"
import { ETHER_IN_WEI } from "../../common"
import { signOrder as signOrderTemplate } from "../sign-order"
import type { OrderRequestV2, OrderRequestV3Sell } from "../upsert-order"
import { OrderRequestEnum, UpsertOrder } from "../upsert-order"
import { OrderFiller } from "../fill-order"
import type { CheckLazyAssetFn } from "../check-lazy-order"
import { CheckLazyOrderService } from "../check-lazy-order"
import type { ApproveFunction } from "../approve"

describe("upsert orders", () => {
	const network = "dev-ethereum" as const

	// The wallet must have funds:
	// 1. to cover mint gas for the mint
	const { provider, wallet } = createE2eProvider(DEV_PK_1, getE2EConfigByNetwork(network))
	const adapters = createTestAdapters(provider, wallet)
	const makerAddress = toAddress(wallet.getAddressString())

	describe.each(adapters.cases)("upsert order $type", ({ adapter }) => {
		let suite: UpsertOrderSuite
		beforeEach(() => {
			suite = new UpsertOrderSuite(network, adapter)
		})

		const orderRequests = [
			{ label: "REQUEST_V2", request: createV2OrderRequest(makerAddress) },
			{ label: "REQUEST_V3_SELL", request: createV3OrderRequest(makerAddress) },
		] as const

		describe.each(orderRequests)("upsert $label", ({ request }) => {
			test("upsert works with ERC721", async () => {
				const minted = await suite.mintTestNft(makerAddress, "erc721V2")
				const partialOrder = await suite.upserter.prepareOrderForm(request, true)
				const pricePerEach = MIN_PAYMENT_VALUE.multipliedBy(ETHER_IN_WEI).plus(1)
				const amountToSell = toBn(1)
				const order: OrderForm = {
					...partialOrder,
					make: {
						assetType: createErc721Asset(minted.contract, minted.tokenId),
						value: toBigNumber(amountToSell.toString()),
					},
					take: {
						assetType: { assetClass: "ETH" },
						value: toBigNumber(pricePerEach.toString()),
					},
				}
				const result = await suite.upserter.upsert({ order })

				expect(suite.approveFn.mock.calls.length).toEqual(1)
				expect(suite.checkLazyOrderFn.mock.calls.length).toEqual(2)
				expect(suite.signOrderFn.mock.calls.length).toEqual(1)

				expect(toBn(result.take.value).eq(pricePerEach)).toBeTruthy()
				expect(toBn(result.make.value).eq(amountToSell)).toBeTruthy()
			})

			test("upsert works with ERC1155", async () => {
				const minted = await suite.mintTestNft(makerAddress, "erc1155V2")
				const pricePerEach = MIN_PAYMENT_VALUE.multipliedBy(ETHER_IN_WEI).plus(1)
				const ethPrice = pricePerEach.multipliedBy(2)
				const amountToSell = toBn(2)
				const partialOrder = await suite.upserter.prepareOrderForm(request, true)
				const order: OrderForm = {
					...partialOrder,
					make: {
						assetType: createErc1155Asset(minted.contract, minted.tokenId),
						value: toBigNumber(amountToSell.toString()),
					},
					take: {
						assetType: { assetClass: "ETH" },
						value: toBigNumber(ethPrice.toString()),
					},
				}
				const result = await suite.upserter.upsert({ order })

				expect(suite.approveFn.mock.calls.length).toEqual(1)
				expect(suite.checkLazyOrderFn.mock.calls.length).toEqual(2)
				expect(suite.signOrderFn.mock.calls.length).toEqual(1)

				expect(toBn(result.take.value).eq(ethPrice)).toBeTruthy()
				expect(toBn(result.make.value).eq(amountToSell)).toBeTruthy()
			})
		})

		test("getPrice should work with ERC20", async () => {
			const takeAsset: EthAssetType = { assetClass: "ETH" }

			// Minimum price for orders
			const priceDecimal = toBn("0.0001")
			const finalPrice = await suite.upserter.getPrice({ priceDecimal }, takeAsset)
			expect(finalPrice.eq("100000000000000")).toBeTruthy()
		})

		test("getPrice should work with ERC20", async () => {
			const erc20 = await deployTestErc20(adapters.web3.getWeb3Instance(), "TST", "TST")
			const erc20Address = toAddress(erc20.options.address)
			const takeAsset: Erc20AssetType = { assetClass: "ERC20", contract: erc20Address }

			// Minimum price for orders
			const priceDecimal = toBn("0.0001")
			const finalPrice = await suite.upserter.getPrice({ priceDecimal }, takeAsset)
			expect(finalPrice.eq("100000000000000")).toBeTruthy()
		})

		test("throw error if sell order has less than minimal payment value", async () => {
			const contractAddress = getTestContract("dev-ethereum", "erc721V3")
			const ethPrice = MIN_PAYMENT_VALUE.multipliedBy(ETHER_IN_WEI).minus(1)

			const dataV3Request = createV3OrderRequest(makerAddress)
			const partialOrder = await suite.upserter.prepareOrderForm(dataV3Request, true)

			const request: OrderForm = {
				...partialOrder,
				make: {
					assetType: {
						assetClass: "ERC721",
						contract: contractAddress,
						tokenId: toBigNumber("42"),
					},
					value: toBigNumber("1"),
				},
				take: {
					assetType: { assetClass: "ETH" },
					value: toBigNumber(ethPrice.toString()),
				},
			}

			await expect(() => suite.upserter.upsertRequest(request))
				.rejects
				.toThrow(/asset value must be greater/i)
		})

	})
})

class UpsertOrderSuite {
	private readonly getBaseOrderFee = () => Promise.resolve(0)
	private readonly send = getSimpleSendWithInjects()
	private readonly getConfigFn = () => Promise.resolve(getEthereumConfig(this.network))
	readonly getApisFn = getApisTemplate.bind(null, this.ethereum, this.network)

	private readonly orderService = new OrderFiller(
		this.ethereum,
		this.send,
		this.getConfigFn,
		this.getApisFn,
		this.getBaseOrderFee,
		this.network
	)

	private readonly approveFnRaw: ApproveFunction = () => Promise.resolve(undefined)
	private readonly checkLazyOrderFnRaw: CheckLazyAssetFn = x => Promise.resolve(x)
	readonly approveFn = jest.fn(this.approveFnRaw.bind(this))
	readonly checkLazyOrderFn = jest.fn(this.checkLazyOrderFnRaw.bind(this))
	private readonly checkLazyOrder = new CheckLazyOrderService(this.checkLazyOrderFn)

	private readonly signNftFn = signNftTemplate.bind(null, this.ethereum, this.getConfigFn)
	readonly mintFn = mintTemplate.bind(null, this.ethereum, this.send, this.signNftFn, this.getApisFn)

	readonly signOrderFnRaw = signOrderTemplate.bind(null, this.ethereum, this.getConfigFn)
	readonly signOrderFn = jest.fn(this.signOrderFnRaw.bind(this))
	readonly upserter = new UpsertOrder(
		this.orderService,
		this.send,
		this.checkLazyOrder,
		this.approveFn,
		this.signOrderFn,
		this.getApisFn,
		this.ethereum,
		ZERO_WORD
	)

	constructor(readonly network: TestContractsNetwork, readonly ethereum: Ethereum) {}

	mintTestNft = async (maker: Address, type: TestContractType) => {
		const request = this.getMintRequest(maker, type)
		const result = await this.mintFn(request)
		if (result.type === MintResponseTypeEnum.ON_CHAIN) {
			await result.transaction.wait()
		}
		return result
	}

	private getMintRequest(maker: Address, type: TestContractType) {
		const contract = getTestContract(this.network, type)
		switch (type) {
			case "erc1155V2":
				return createMintErc1155Request(contract, maker)
			case "erc721V3": case "erc721V2":
				return createMintErc721Request(contract, maker)
			default:
				throw new Error("Unexpected nft mint type")
		}
	}
}

function createV3OrderRequest(maker: Address): OrderRequestV3Sell {
	return {
		type: OrderRequestEnum.DATA_V3_SELL,
		maker,
		payout: createFullPayout(maker),
		maxFeesBasePoint: 200,
		end: generateExpiration(),
	}
}

function createV2OrderRequest(maker: Address): OrderRequestV2 {
	return {
		type: OrderRequestEnum.DATA_V2,
		maker,
		payouts: [createFullPayout(maker)],
		originFees: [],
		end: generateExpiration(),
	}
}

function generateExpiration() {
	return Date.now() + 1000 * 60 * 60 * 24 * 30
}

function createMintErc721Request(contract: Address, maker: Address): MintRequest {
	return {
		collection: createErc721V3Collection(contract),
		uri: "ipfs://hash",
		creators: [createFullPayout(maker)],
		royalties: [],
		lazy: false,
	}
}

function createMintErc1155Request(contract: Address, maker: Address): MintRequest {
	return {
		collection: createErc1155V2Collection(contract),
		uri: "ipfs://hash",
		supply: 42,
		creators: [createFullPayout(maker)],
		royalties: [],
		lazy: false,
	}
}

function createErc721Asset(contract: Address, tokenId: BigNumber): Erc721AssetType {
	return {
		assetClass: "ERC721",
		contract,
		tokenId,
	}
}

function createErc1155Asset(contract: Address, tokenId: BigNumber): Erc1155AssetType {
	return {
		assetClass: "ERC1155",
		contract,
		tokenId,
	}
}

function createFullPayout(maker: Address): Part {
	return { account: maker, value: 10000 }
}