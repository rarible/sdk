import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import { Action } from "@rarible/action"
import type { Address, AssetType } from "@rarible/ethereum-api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import { BigNumber as BigNum, toBn } from "@rarible/utils"
import type { BigNumber } from "@rarible/types"
import { toAddress } from "@rarible/types"
import type { SimpleOpenSeaV1Order, SimpleOrder, SimpleRaribleV2Order } from "../../types"
import type { SendFunction } from "../../../common/send-transaction"
import type { EthereumConfig } from "../../../config/type"
import type { RaribleEthereumApis } from "../../../common/apis"
import type { CheckAssetTypeFunction } from "../../check-asset-type"
import { checkAssetType } from "../../check-asset-type"
import { checkLazyAssetType } from "../../check-lazy-asset-type"
import { checkChainId } from "../../check-chain-id"
import type { IRaribleEthereumSdkConfig } from "../../../types"
import type { EthereumNetwork } from "../../../types"
import type {
	AmmOrderFillRequest,
	FillBatchOrderAction,
	FillBatchOrderRequest,
	FillBatchSingleOrderRequest,
	FillOrderStageId, LooksrareOrderFillRequest,
	OpenSeaV1OrderFillRequest,
	OrderFillSendData,
	PreparedOrderRequestDataForExchangeWrapper,
	RaribleV2OrderFillRequest,
} from "../types"
import { RaribleV2OrderHandler } from "../rarible-v2"
import { OpenSeaOrderHandler } from "../open-sea"
import { SeaportOrderHandler } from "../seaport"
import { LooksrareOrderHandler } from "../looksrare"
import { OriginFeeReducer } from "../common/origin-fee-reducer"
import { X2Y2OrderHandler } from "../x2y2"
import { AmmOrderHandler } from "../amm"
import { createExchangeWrapperContract } from "../../contracts/exchange-wrapper"
import type { SeaportV1OrderFillRequest } from "../types"
import type { X2Y2OrderFillRequest } from "../types"
import { getUpdatedCalldata } from "../common/get-updated-call"
import { getRequiredWallet } from "../../../common/get-required-wallet"

export class BatchOrderFiller {
	v2Handler: RaribleV2OrderHandler
	openSeaHandler: OpenSeaOrderHandler
	seaportHandler: SeaportOrderHandler
	looksrareHandler: LooksrareOrderHandler
	x2Y2Handler: X2Y2OrderHandler
	ammHandler: AmmOrderHandler
	private checkAssetType: CheckAssetTypeFunction
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private checkLazyAssetType: (type: AssetType) => Promise<AssetType>

	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
		private readonly apis: RaribleEthereumApis,
		private readonly getBaseOrderFee: (type: SimpleOrder["type"]) => Promise<number>,
		private readonly env: EthereumNetwork,
		private readonly sdkConfig?: IRaribleEthereumSdkConfig
	) {
		this.v2Handler = new RaribleV2OrderHandler(ethereum, send, config, getBaseOrderFee)
		this.openSeaHandler = new OpenSeaOrderHandler(ethereum, send, config, apis, getBaseOrderFee, sdkConfig)
		this.seaportHandler = new SeaportOrderHandler(ethereum, send, config, getBaseOrderFee, env)
		this.looksrareHandler = new LooksrareOrderHandler(ethereum, send, config, getBaseOrderFee, env, apis)
		this.x2Y2Handler = new X2Y2OrderHandler(ethereum, send, config, getBaseOrderFee, apis)
		this.ammHandler = new AmmOrderHandler(ethereum, send, config, getBaseOrderFee, apis, env)
		this.checkAssetType = checkAssetType.bind(this, apis.nftCollection)
		this.checkLazyAssetType = checkLazyAssetType.bind(this, apis.nftItem)
		this.getTransactionRequestData = this.getTransactionRequestData.bind(this)
	}

	/**
	 * Buy batch of orders
	 *
	 * Note: Additional origin fees applied only for opensea orders
	 */
	buy: FillBatchOrderAction = this.getFillAction()

	private getFillAction<Request extends FillBatchOrderRequest>()
	: Action<FillOrderStageId, Request, EthereumTransaction> {
		return Action
			.create({
				id: "approve" as const,
				run: async (request: Request) => {
					if (!this.ethereum) {
						throw new Error("Wallet undefined")
					}
					if (!request.length) {
						throw new Error("Request is empty")
					}

					const originFeeReducer = new OriginFeeReducer()
					const preparedOrders = await this.prepareOrders(request, originFeeReducer)

					return { preparedOrders, feeAddresses: originFeeReducer.getAddresses() }
				},
			})
			.thenStep({
				id: "send-tx" as const,
				run: async ({ preparedOrders, feeAddresses }: {
					preparedOrders: PreparedOrder[],
					feeAddresses: [Address, Address]
				}) => {
					const { functionCall, options } = await this.getTransactionRequestData(preparedOrders, feeAddresses)
					return this.send(functionCall, options)
				},
			})
			.before(async (input: Request) => {
				await checkChainId(this.ethereum, this.config)
				return input
			})
	}

	/**
	 * Convert origin fees & invert and approve orders
	 * @private
	 */
	private async prepareOrders(
		requests: FillBatchOrderRequest,
		feesReducer: OriginFeeReducer
	): Promise<PreparedOrder[]> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}

		const from = toAddress(await this.ethereum.getFrom())

		return await Promise.all(requests.map(async (request) => {
			if (request.order.take.assetType.assetClass !== "ETH") {
				throw new Error("Batch purchase only available for ETH currency")
			}

			if (
				request.order.type !== "RARIBLE_V2" &&
				request.order.type !== "OPEN_SEA_V1" &&
				request.order.type !== "LOOKSRARE" &&
				request.order.type !== "SEAPORT_V1" &&
				request.order.type !== "X2Y2" &&
				request.order.type !== "AMM"
			) {
				throw new Error("Unsupported order type for batch purchase")
			}

			const fees = feesReducer.reduce(request.originFees)

			let inverted: SimpleOrder | undefined = undefined
			if (
				request.order.type === "RARIBLE_V2" ||
				request.order.type === "OPEN_SEA_V1"
			) {
				inverted = await this.invertOrder(request, from)
				if (request.assetType && inverted.make.assetType.assetClass === "COLLECTION") {
					inverted.make.assetType = await this.checkAssetType(request.assetType)
					inverted.make.assetType = await this.checkLazyAssetType(inverted.make.assetType)
				}
				await this.approveOrder(inverted, Boolean(request.infinite))
			}

			return {
				request,
				inverted,
				fees,
			}
		}))
	}

	private async invertOrder(request: FillBatchSingleOrderRequest, from: Address) {
		switch (request.order.type) {
			case "RARIBLE_V2":
				return this.v2Handler.invert(<RaribleV2OrderFillRequest>request, from)
			case "OPEN_SEA_V1":
				return this.openSeaHandler.invert(<OpenSeaV1OrderFillRequest>request, from)
			default:
				throw new Error(`Unsupported order: ${request.order.type}`)
		}
	}

	private async approveOrder(inverted: SimpleOrder, isInfinite: boolean) {
		switch (inverted.type) {
			case "RARIBLE_V2":
				return this.v2Handler.approve(inverted, isInfinite)
			case "OPEN_SEA_V1":
				return this.openSeaHandler.approve(inverted, isInfinite)
			default:
				throw new Error(`Unsupported order: ${inverted.type}`)
		}
	}

	/**
	 * Prepare contract function call
	 */
	private async getTransactionRequestData(
		preparedOrders: PreparedOrder[],
		feeAddresses: [Address, Address]
	): Promise<OrderFillSendData> {
		let totalValue = toBn(0)

		const ordersCallData = await Promise.all(
			preparedOrders.map(async (preparedOrder) => {
				const requestData = await this.getOrderData(preparedOrder)
				totalValue = totalValue.plus(requestData.options?.value || 0)
				return requestData.data
			})
		)

		const wrapperContract = createExchangeWrapperContract(this.ethereum!, this.config.exchange.wrapper)
		const functionCall = wrapperContract.functionCall(
			"bulkPurchase",
			ordersCallData,
			feeAddresses[0],
			feeAddresses[1],
			true // allowFail
		)
		let gasLimit = await wrapperContract.functionCall(
			"bulkPurchase",
			ordersCallData,
			feeAddresses[0],
			feeAddresses[1],
			false // allowFail
		).estimateGas({
			value: totalValue.toString(),
			from: await getRequiredWallet(this.ethereum).getFrom(),
		})
		const gasLimitWithTheshold = toBn(gasLimit)
			.multipliedBy(1.1)
			.integerValue(BigNum.ROUND_FLOOR)
			.toNumber()

		return {
			functionCall,
			options: {
				value: totalValue.toString(),
				gas: gasLimitWithTheshold,
				additionalData: getUpdatedCalldata(this.sdkConfig),
			},
		}
	}

	private async getOrderData(
		preparedOrder: PreparedOrder
	): Promise<PreparedOrderRequestDataForExchangeWrapper> {
		switch (preparedOrder.request.order.type) {
			case "RARIBLE_V2":
				return this.v2Handler.getTransactionDataForExchangeWrapper(
          <SimpleRaribleV2Order>preparedOrder.request.order,
          <SimpleRaribleV2Order>preparedOrder.inverted,
				)
			case "OPEN_SEA_V1":
				return this.openSeaHandler.getTransactionDataForExchangeWrapper(
          <SimpleOpenSeaV1Order>preparedOrder.request.order,
					<SimpleOpenSeaV1Order>preparedOrder.inverted,
					preparedOrder.request.originFees,
					preparedOrder.fees
				)
			case "SEAPORT_V1":
				return this.seaportHandler.getTransactionDataForExchangeWrapper(
					<SeaportV1OrderFillRequest>preparedOrder.request,
					preparedOrder.request.originFees,
					preparedOrder.fees
				)
			case "LOOKSRARE":
				return this.looksrareHandler.getTransactionDataForExchangeWrapper(
					<LooksrareOrderFillRequest>preparedOrder.request,
					preparedOrder.request.originFees,
					preparedOrder.fees
				)
			case "X2Y2":
				return this.x2Y2Handler.getTransactionDataForExchangeWrapper(
					<X2Y2OrderFillRequest>preparedOrder.request,
					preparedOrder.request.originFees,
					preparedOrder.fees
				)
			case "AMM":
				return this.ammHandler.getTransactionDataForExchangeWrapper(
					<AmmOrderFillRequest>preparedOrder.request,
					preparedOrder.fees
				)
			default:
				//@ts-ignore
				throw new Error(`Unsupported request type: ${preparedOrder.request.order.type}`)
		}
	}
}


type PreparedOrder = {
	request: FillBatchSingleOrderRequest
	inverted?: SimpleOrder
	fees: BigNumber
}
