import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import { toAddress, toBigNumber } from "@rarible/types"
import type { Part } from "@rarible/ethereum-api-client"
import { AuctionStatus } from "@rarible/ethereum-api-client"
import { Action } from "@rarible/action"
import type { Auction } from "@rarible/ethereum-api-client/build/models"
import { toBn } from "@rarible/utils"
import type { ApproveFunction } from "../order/approve"
import { waitTx } from "../common/wait-tx"
import { getPrice } from "../common/get-price"
import type { SendFunction } from "../common/send-transaction"
import { validateParts } from "../common/validate-part"
import type { RaribleEthereumApis } from "../common/apis"
import { getBaseFee } from "../common/get-base-fee"
import type { EthereumNetwork } from "../types"
import type { GetConfigByChainId } from "../config"
import { getNetworkConfigByChainId } from "../config"
import { createEthereumAuctionContract } from "./contracts/auction"
import { AUCTION_BID_DATA_V1, AUCTION_DATA_TYPE, calculatePartsSum, getAuctionOperationOptions } from "./common"

export type PutBidRequest = {
	hash: string
	priceDecimal: BigNumber
	originFees?: Part[]
}
export type PutAuctionBidAction = Action<"approve" | "sign", PutBidRequest, EthereumTransaction>

export class PutAuctionBid {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly getConfig: GetConfigByChainId,
		private readonly env: EthereumNetwork,
		private readonly approve: ApproveFunction,
		private readonly getApis: () => Promise<RaribleEthereumApis>,
	) {}

	private async getBaseFee() {
		return getBaseFee(this.env, this.getApis, "AUCTION")
	}

	readonly putBid: PutAuctionBidAction = Action.create({
		id: "approve" as const,
		run: async (request: PutBidRequest) => {
			if (!this.ethereum) {
				throw new Error("Wallet is undefined")
			}
			const apis = await this.getApis()
			const auction = await apis.auction.getAuctionByHash({ hash: request.hash })
			this.validate(request, auction)

			const price = toBigNumber((await getPrice(this.ethereum, auction.buy, request.priceDecimal)).toString())

			if (auction.buy.assetClass !== "ETH") {
				await waitTx(
					this.approve(
						toAddress(await this.ethereum.getFrom()),
						{ assetType: auction.buy, value: price },
						true
					)
				)
			}
			return { request, auction, price }
		},
	})
		.thenStep({
			id: "sign" as const,
			run: async ({ request, auction, price }: { request: PutBidRequest, auction: Auction, price: BigNumber}) => {
				if (!this.ethereum) {
					throw new Error("Wallet is undefined")
				}
				const config = getNetworkConfigByChainId(await this.ethereum.getChainId())
				const bidderOriginFees = request.originFees || []
				const bidData = this.ethereum.encodeParameter(AUCTION_BID_DATA_V1, {
					payouts: [],
					originFees: bidderOriginFees,
				})
				const bid = {
					amount: price,
					dataType: AUCTION_DATA_TYPE,
					data: bidData,
				}
				const protocolFee = await this.getBaseFee()
				const totalFees = calculatePartsSum(bidderOriginFees.concat(auction.data.originFees)) + protocolFee
				const options = getAuctionOperationOptions(auction.buy, price, totalFees)
				const contract = createEthereumAuctionContract(this.ethereum, config.auction)
				return this.send(
					contract.functionCall("putBid", auction.auctionId, bid),
					options
				)
			},
		})

	validate(request: PutBidRequest, auction: Auction): boolean {
		if (auction.status !== AuctionStatus.ACTIVE) {
			throw new Error(`Auction status is ${auction.status}, expected ${AuctionStatus.ACTIVE}`)
		}

		const price = toBn(request.priceDecimal)
		if (price.isNaN() || !price.isPositive()) {
			throw new Error("Wrong bid price")
		}

		if (auction.lastBid) {
			const lastBid = toBn(auction.lastBid.amount)
			const minimalNextPrice = lastBid.plus(auction.minimalStep)
			if (minimalNextPrice.isLessThan(price)) {
				throw new Error("Bid price should be greater")
			}
		} else {
			if (price.isLessThan(auction.minimalPrice)) {
				throw new Error("Bid price should be greater than minimal price")
			}
		}
		validateParts(request.originFees)

		return true
	}
}
