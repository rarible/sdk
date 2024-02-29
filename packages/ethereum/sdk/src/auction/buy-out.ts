import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import { toAddress, toBigNumber } from "@rarible/types"
import type { Part } from "@rarible/ethereum-api-client"
import { Action } from "@rarible/action"
import type { Auction } from "@rarible/ethereum-api-client/build/models"
import type { ApproveFunction } from "../order/approve"
import { getPrice } from "../common/get-price"
import type { SendFunction } from "../common/send-transaction"
import type { RaribleEthereumApis } from "../common/apis"
import type { EthereumNetwork } from "../types"
import { getBaseFee } from "../common/get-base-fee"
import type { GetConfigByChainId } from "../config"
import { getRequiredWallet } from "../common/get-required-wallet"
import { createEthereumAuctionContract } from "./contracts/auction"
import {
	AUCTION_BID_DATA_V1,
	AUCTION_DATA_TYPE, calculatePartsSum,
	getAuctionOperationOptions,
	validateAuctionRangeTime,
} from "./common"

export type BuyOutRequest = {
	hash: string
	originFees?: Part[]
}
export type BuyoutAuctionAction = Action<"approve" | "sign", BuyOutRequest, EthereumTransaction>

export class BuyoutAuction {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly getConfig: GetConfigByChainId,
		private readonly env: EthereumNetwork,
		private readonly approve: ApproveFunction,
		private readonly getApis: () => Promise<RaribleEthereumApis>,
	) {}

	private async getBaseFee() {
		return getBaseFee(this.env, () => this.getApis(), "AUCTION")
	}

	readonly buyout: BuyoutAuctionAction = Action.create({
		id: "approve" as const,
		run: async (request: BuyOutRequest) => {
			const wallet = getRequiredWallet(this.ethereum)
			const apis = await this.getApis()
			const auction = await apis.auction.getAuctionByHash({ hash: request.hash })
			this.validate(auction)
			if (auction.data.buyOutPrice === undefined) {
				throw new Error("Buy out is unavailable for current auction")
			}

			const buyoutPrice = await getPrice(wallet, auction.buy, auction.data.buyOutPrice)
			const buyoutPriceBn = toBigNumber(buyoutPrice.toString())

			if (auction.buy.assetClass !== "ETH") {
				const asset = { assetType: auction.buy, value: buyoutPriceBn }
				const from = await wallet.getFrom()
				const approveTx = await this.approve(toAddress(from), asset, true)
				if (approveTx) {
					// Wait for approval to be confirmed
					await approveTx.wait()
				}
			}

			return { request, auction, price: buyoutPriceBn }
		},
	})
		.thenStep({
			id: "sign" as const,
			run: async ({ request, auction, price }: { request: BuyOutRequest, auction: Auction, price: BigNumber}) => {
				const wallet = getRequiredWallet(this.ethereum)
				const buyerOriginFees = request.originFees || []
				const bidData = wallet.encodeParameter(AUCTION_BID_DATA_V1, {
					payouts: [],
					originFees: buyerOriginFees,
				})
				const bid = {
					amount: price,
					dataType: AUCTION_DATA_TYPE,
					data: bidData,
				}

				const protocolFee = await this.getBaseFee()
				const totalFees = calculatePartsSum(buyerOriginFees.concat(auction.data.originFees)) + protocolFee
				const options = getAuctionOperationOptions(auction.buy, price, totalFees)
				const config = await this.getConfig()
				const contract = createEthereumAuctionContract(wallet, config.auction)
				return this.send(
					contract.functionCall("buyOut", auction.auctionId, bid),
					options
				)
			},
		})

	validate(auction: Auction) {
		if (!validateAuctionRangeTime(auction)) {
			throw new Error("Auction should be active")
		}
	}
}
