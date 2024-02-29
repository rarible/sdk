import type { Ethereum } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import type { BigNumber } from "@rarible/types"
import { toAddress, toBigNumber } from "@rarible/types"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import { Action } from "@rarible/action"
import type { AssetType } from "@rarible/ethereum-api-client"
import { toBn } from "@rarible/utils"
import type { Erc20AssetType, EthAssetType, Part } from "@rarible/ethereum-api-client"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { id } from "../common/id"
import type { ApproveFunction } from "../order/approve"
import { getPrice } from "../common/get-price"
import type { AssetTypeRequest, AssetTypeResponse } from "../order/check-asset-type"
import type { RaribleEthereumApis } from "../common/apis"
import { checkAssetType } from "../order/check-asset-type"
import type { SendFunction } from "../common/send-transaction"
import { validateParts } from "../common/validate-part"
import type { EthereumNetwork } from "../types"
import type { GetConfigByChainId } from "../config"
import { isNftAssetType, isPaymentAssetType } from "../common/asset-types"
import { createEthereumAuctionContract } from "./contracts/auction"
import { AUCTION_DATA_TYPE, AUCTION_DATA_V1, getAssetEncodedData, getAuctionHash } from "./common"

export type CreateAuctionRequest = {
	makeAssetType: AssetTypeRequest,
	amount: BigNumber,
	takeAssetType: EthAssetType | Erc20AssetType,
	minimalStepDecimal: BigNumberValue,
	minimalPriceDecimal: BigNumberValue,
	duration: number,
	startTime?: number,
	buyOutPriceDecimal: BigNumberValue,
	originFees?: Part[],
}


export type AuctionStartAction = Action<"approve" | "sign", CreateAuctionRequest, AuctionStartResponse>
export type AuctionStartResponse = {
	tx: EthereumTransaction
	hash: Promise<string>
	auctionId: Promise<BigNumber>
}

export class StartAuction {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private readonly checkAssetType: (asset: AssetTypeRequest) => Promise<AssetTypeResponse>
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private readonly MAX_DURATION_SECONDS = 60 * 60 * 24 * 1000 //1000 days
	private readonly MIN_DURATION_SECONDS = 60 * 60 * 15 // 15 minutes

	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly getConfig: GetConfigByChainId,
		private readonly env: EthereumNetwork,
		private readonly approve: ApproveFunction,
		private readonly getApis: () => Promise<RaribleEthereumApis>,
	) {
		this.checkAssetType = checkAssetType.bind(null, getApis)
	}

	private async getAuctionHash(auctionId: BigNumber): Promise<string> {
		return getAuctionHash(this.ethereum, () => this.getConfig(), auctionId)
	}

	readonly start: AuctionStartAction = Action.create({
		id: "approve" as const,
		run: async (request: CreateAuctionRequest) => {
			if (!this.ethereum) {
				throw new Error("Wallet is undefined")
			}
			const makeAssetType = await this.checkAssetType(request.makeAssetType)
			this.validate(request, makeAssetType)

			const fromRaw = await this.ethereum.getFrom()
			const asset = { assetType: makeAssetType, value: request.amount }
			const approveTx = await this.approve(toAddress(fromRaw), asset, true)

			if (approveTx) {
				// Wait for approve tx before signature
				await approveTx.wait()
			}

			return { request, makeAssetType }
		},
	})
		.thenStep({
			id: "sign" as const,
			run: async ({ request, makeAssetType }: { request: CreateAuctionRequest, makeAssetType: AssetTypeResponse}) => {
				if (!this.ethereum) {
					throw new Error("Wallet is undefined")
				}
				const config = await this.getConfig()

				const sellAsset = {
					assetType: {
						assetClass: id(makeAssetType.assetClass),
						data: getAssetEncodedData(this.ethereum, makeAssetType),
					},
					value: request.amount,
				}
				const buyAssetType = {
					assetClass: id(request.takeAssetType.assetClass),
					data: getAssetEncodedData(this.ethereum, request.takeAssetType),
				}

				const data = this.ethereum.encodeParameter(AUCTION_DATA_V1, {
					payouts: [],
					originFees: request.originFees || [],
					duration: request.duration,
					startTime: request.startTime || 0,
					buyOutPrice: (await getPrice(this.ethereum, request.takeAssetType, request.buyOutPriceDecimal)).toString(),
				})

				const tx = await this.send(
					await createEthereumAuctionContract(this.ethereum, config.auction)
						.functionCall(
							"startAuction",
							sellAsset,
							buyAssetType,
							(await getPrice(this.ethereum, request.takeAssetType, request.minimalStepDecimal)).toString(),
							(await getPrice(this.ethereum, request.takeAssetType, request.minimalPriceDecimal)).toString(),
							AUCTION_DATA_TYPE,
							data,
						)
				)


				const auctionIdPromise = tx.getEvents()
					.then(async events => {
						const createdEvent = events.find(e => e.event === "AuctionCreated")
						if (!createdEvent) throw new Error("AuctionCreated event has not been found")
						return toBigNumber(createdEvent.args.auctionId)
					})

				const hashPromise = auctionIdPromise
					.then((auctionId) => {
						return this.getAuctionHash(auctionId)
					})

				return {
					tx,
					hash: hashPromise,
					auctionId: auctionIdPromise,
				}
			},
		})

	validate(request: CreateAuctionRequest, makeAssetType: AssetType): boolean {
		if (!isNftAssetType(makeAssetType)) {
			throw new Error("Make asset should be NFT token")
		}
		if (makeAssetType.assetClass === "ERC721_LAZY" || makeAssetType.assetClass === "ERC1155_LAZY") {
			throw new Error("Auction cannot be created with lazy assets")
		}
		if (!isPaymentAssetType(request.takeAssetType)) {
			throw new Error("Take asset should be payment token (ETH or ERC-20)")
		}
		const minPrice = toBn(request.minimalPriceDecimal)
		if (!minPrice.isPositive()) {
			throw new Error("Minimal price should be a correct value")
		}

		const step = toBn(request.minimalStepDecimal)
		if (!step.isPositive()) {
			throw new Error("Minimal step should be a correct value")
		}

		const startTimestamp = toBn(request.startTime || 0)
		if (!startTimestamp.isZero()) {
			if (startTimestamp.isNaN() || !startTimestamp.isInteger() || startTimestamp.isNegative()) {
				throw new Error(`Wrong auction start time timestamp = ${startTimestamp.toString()}`)
			}
			if (startTimestamp.isLessThan(Date.now() / 1000)) {
				throw new Error("Auction start time should be greater than current time")
			}
		}

		const duration = toBn(request.duration)
		if (duration.isNaN() || duration.isNegative() || duration.isGreaterThan(this.MAX_DURATION_SECONDS)) {
			throw new Error("Incorrect duration value")
		}
		if (this.env !== "testnet" && duration.isLessThan(this.MIN_DURATION_SECONDS)) {
			throw new Error("Auction duration should be greater than minimal duration time")
		}

		const buyout = toBn(request.buyOutPriceDecimal)
		if (!buyout.isPositive() || buyout.isLessThanOrEqualTo(minPrice)) {
			throw new Error("Auction buyout price should be correct and greater than minimal price")
		}
		const amount = toBn(request.amount)
		if (!amount.isInteger() || amount.isLessThanOrEqualTo(0)) {
			throw new Error("Auction asset amount should be integer and greater than 0")
		}

		validateParts(request.originFees)
		return true
	}
}
