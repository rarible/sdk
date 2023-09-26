import type { BigNumber } from "@rarible/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum, EthereumContract } from "@rarible/ethereum-provider"
import { toAddress, toBigNumber } from "@rarible/types"
import type { Erc721AssetType } from "@rarible/ethereum-api-client"
import type { Address, Asset } from "@rarible/ethereum-api-client"
import { toBn } from "@rarible/utils"
import type { AssetTypeRequest, AssetTypeResponse } from "../order/check-asset-type"
import type { SendFunction } from "../common/send-transaction"
import type { EthereumConfig } from "../config/type"
import type { EthereumNetwork } from "../types"
import type { ApproveFunction } from "../order/approve"
import { getRequiredWallet } from "../common/get-required-wallet"
import { waitTx } from "../common/wait-tx"
import { pureApproveFn } from "../order/approve"
import { lotteryAbi } from "./contracts/lottery"

export class Lottery {
	lottery: EthereumContract | undefined
  approve: ApproveFunction
  constructor(
  	private readonly ethereum: Maybe<Ethereum>,
  	private readonly send: SendFunction,
  	private readonly config: EthereumConfig,
  	private readonly env: EthereumNetwork,
  	// private readonly approve: ApproveFunction,
  	private readonly checkAssetType: (asset: AssetTypeRequest) => Promise<AssetTypeResponse>,
  ) {
  	this.startLottery = this.startLottery.bind(this)
  	this.buyTickets = this.buyTickets.bind(this)
  	this.finaliseLottery = this.finaliseLottery.bind(this)
  	this.getLotteryData = this.getLotteryData.bind(this)
  	const wallet = getRequiredWallet(this.ethereum)
  	if (config.lottery) {
  		this.lottery = wallet.createContract(lotteryAbi, config.lottery)
  	}

  	this.approve = (
  		owner: Address,
  		asset: Asset,
  		infinite: undefined | boolean = true
  	) => {
  		const operator = config.lottery
  		if (!operator) {
  			throw new Error("Lottery contract does not exist")
  		}
  		return pureApproveFn({ ethereum, send, operator, owner, asset, infinite })
  	}
  }

  getRequiredLottery(): EthereumContract {
  	if (!this.lottery) {
  		throw new Error("Contract is not available on this environment")
  	}
  	return this.lottery
  }

  async startLottery(request: {
  	makeAssetType: AssetTypeRequest,
  	price: BigNumber,
  	tickets: BigNumber,
  }) {
  	const wallet = getRequiredWallet(this.ethereum)
  	const amount = toBigNumber("1")
  	const makeAssetType = await this.checkAssetType(request.makeAssetType) as Erc721AssetType
  	console.log("make ass", makeAssetType)
  	const approveOperation = this.approve(
  		toAddress(await wallet.getFrom()),
  		{
  			assetType: makeAssetType,
  			value: amount,
  		},
  		true
  	)
  	console.log("approveOperation", approveOperation)
  	if (approveOperation) {
  		await waitTx(approveOperation)
  	}
  	console.log("after approveOperation", [makeAssetType.contract,
  		makeAssetType.tokenId,
  		request.price,
  		request.tickets])

  	const fnCall = this.getRequiredLottery().functionCall(
  		"startLottery",
  		makeAssetType.contract,
  		makeAssetType.tokenId,
  		request.price,
  		request.tickets,
  	)

  	const tx = await this.send(fnCall)
  	const lotteryIdPromise = tx.getEvents()
  		.then(async events => {
  			const lotteryEvent = events.find(e => e.event === "LotteryCreated")
  			if (!lotteryEvent) throw new Error("LotteryCreated event has not been found")
  			console.log("lotteryEvent", lotteryEvent)
  			return lotteryEvent.args.lotteryId
  		})

  	return {
  		tx,
  		lotteryId: lotteryIdPromise,
  	}
  }

  async buyTickets(request: {
  	lotteryId: BigNumber,
  	amount: BigNumber,
  }) {
  	const lotteryDetails = await this.getRequiredLottery()
  		.functionCall("lotteries", request.lotteryId).call()
  	const amount = toBn(request.amount)
  	if (amount.gt(lotteryDetails.amountOfTikectsNeeded)) {
  		throw new Error(`Tickets amount cannot be greater than ${lotteryDetails.amountOfTikectsNeeded}`)
  	}
  	const price = toBn(lotteryDetails.price).div(lotteryDetails.amountOfTikectsNeeded)
  	const value = toBn(price).multipliedBy(request.amount)
  	const fnCall = this.getRequiredLottery().functionCall(
  		"buyTikects",
  		request.lotteryId,
  		request.amount
  	)

  	console.log("details", lotteryDetails, "value.toFixed()", value)
  	return this.send(fnCall, { value: value.toFixed() })
  }

  async finaliseLottery(request: {
  	lotteryId: BigNumber,
  }) {
  	const fnCall = this.getRequiredLottery().functionCall(
  		"finaliseLottery",
  		request.lotteryId,
  	)

  	return this.send(fnCall)
  }

  async getLotteryData(lotteryId: BigNumber) {
  	const [
  		isLotteryFinalized,
  		ticketsLeft,
  		buyers,
  		lottery,
  	] = await Promise.all([
  		this.getRequiredLottery().functionCall("isLotteryFinalised", lotteryId).call(),
  		this.getRequiredLottery().functionCall("getTicketsLeft", lotteryId).call(),
  		this.getRequiredLottery().functionCall("getBuyers", lotteryId).call(),
  		this.getRequiredLottery().functionCall("lotteries", lotteryId).call(),
  	])
  	return {
  		isFinalized: isLotteryFinalized,
  		ticketsLeft,
  		buyers,
  		details: {
  			token: toAddress(lottery.token),
  			tokenId: toBigNumber(lottery.tokenId),
  			price: toBigNumber(lottery.price),
  			amountOfTicketsNeeded: toBigNumber(lottery.amountOfTikectsNeeded),
  			amountOfTicketsBought: toBigNumber(lottery.amountOfTikectsBought),
  			seller: toAddress(lottery.seller),
  		},
  	}
  }
}
