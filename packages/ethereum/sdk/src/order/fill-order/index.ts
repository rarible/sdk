import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import { toAddress } from "@rarible/types"
import { Action } from "@rarible/action"
import type { Address, AssetType } from "@rarible/ethereum-api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import type { GetAmmBuyInfoRequest } from "@rarible/ethereum-api-client/build/apis/OrderControllerApi"
import type { AmmTradeInfo } from "@rarible/ethereum-api-client/build/models"
import type {
	SimpleCryptoPunkOrder,
	SimpleLegacyOrder,
	SimpleOpenSeaV1Order,
	SimpleOrder,
	SimpleRaribleV2Order,
} from "../types"
import type { SendFunction } from "../../common/send-transaction"
import type { RaribleEthereumApis } from "../../common/apis"
import type { CheckAssetTypeFunction } from "../check-asset-type"
import { checkAssetType } from "../check-asset-type"
import { checkLazyAssetType } from "../check-lazy-asset-type"
import type { IRaribleEthereumSdkConfig } from "../../types"
import type { EthereumNetwork } from "../../types"
import type { GetConfigByChainId } from "../../config"
import type {
	CryptoPunksOrderFillRequest,
	FillOrderAction,
	FillOrderRequest,
	FillOrderStageId,
	GetOrderBuyTxRequest,
	LegacyOrderFillRequest,
	OpenSeaV1OrderFillRequest,
	OrderFillSendData,
	OrderFillTransactionData,
	RaribleV2OrderFillRequest,
	BuyOrderRequest,
	SellOrderRequest,
	TransactionData,
	SeaportV1OrderFillRequest,
	SellOrderAction,
	BuyOrderAction,
	LooksrareOrderFillRequest,
	X2Y2OrderFillRequest,
	AmmOrderFillRequest,
} from "./types"
import { RaribleV1OrderHandler } from "./rarible-v1"
import { RaribleV2OrderHandler } from "./rarible-v2"
import { OpenSeaOrderHandler } from "./open-sea"
import { CryptoPunksOrderHandler } from "./crypto-punks"
import { SeaportOrderHandler } from "./seaport"
import { X2Y2OrderHandler } from "./x2y2"
import { LooksrareOrderHandler } from "./looksrare"
import { AmmOrderHandler } from "./amm"
import { getUpdatedCalldata } from "./common/get-updated-call"
import { LooksrareV2OrderHandler } from "./looksrare-v2"
import type { LooksrareOrderV2FillRequest } from "./types"
import { BaseFeeService } from "../../common/base-fee"

export class OrderFiller {
	v1Handler: RaribleV1OrderHandler
	v2Handler: RaribleV2OrderHandler
	openSeaHandler: OpenSeaOrderHandler
	punkHandler: CryptoPunksOrderHandler
	seaportHandler: SeaportOrderHandler
	looksrareHandler: LooksrareOrderHandler
	looksrareV2Handler: LooksrareV2OrderHandler
	x2y2Handler: X2Y2OrderHandler
	ammHandler: AmmOrderHandler
	private checkAssetType: CheckAssetTypeFunction
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private checkLazyAssetType: (type: AssetType) => Promise<AssetType>

	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly getConfig: GetConfigByChainId,
		private readonly getApis: () => Promise<RaribleEthereumApis>,
		private readonly baseFeeService: BaseFeeService,
		private readonly env: EthereumNetwork,
		private readonly sdkConfig?: IRaribleEthereumSdkConfig,
	) {
		this.getBaseOrderFillFee = this.getBaseOrderFillFee.bind(this)
		this.getTransactionData = this.getTransactionData.bind(this)
		this.getBuyTx = this.getBuyTx.bind(this)
		this.v1Handler = new RaribleV1OrderHandler(
			ethereum,
			getApis,
			send,
			getConfig,
			baseFeeService,
			sdkConfig,
		)
		this.v2Handler = new RaribleV2OrderHandler(ethereum, send, getConfig, getBaseOrderFee, sdkConfig)
		this.openSeaHandler = new OpenSeaOrderHandler(ethereum, send, getConfig, getApis, getBaseOrderFee, sdkConfig)
		this.punkHandler = new CryptoPunksOrderHandler(ethereum, send, getConfig, getBaseOrderFee, sdkConfig)
		this.seaportHandler = new SeaportOrderHandler(ethereum, send, getConfig, getApis, getBaseOrderFee, env, sdkConfig)
		this.looksrareHandler = new LooksrareOrderHandler(
			ethereum,
			send,
			getConfig,
			getBaseOrderFee,
			env,
			getApis,
			sdkConfig,
		)
		this.looksrareV2Handler = new LooksrareV2OrderHandler(
			ethereum,
			send,
			getConfig,
			getBaseOrderFee,
			env,
			getApis,
		)
		this.x2y2Handler = new X2Y2OrderHandler(ethereum, send, getConfig, getBaseOrderFee, getApis)
		this.ammHandler = new AmmOrderHandler(
			ethereum,
			send,
			getConfig,
			getBaseOrderFee,
			getApis,
			env,
			sdkConfig
		)
		this.checkAssetType = checkAssetType.bind(this, getApis)
		this.checkLazyAssetType = checkLazyAssetType.bind(this, getApis)
		this.getBuyAmmInfo = this.getBuyAmmInfo.bind(this)
	}

	private getFillAction<Request extends FillOrderRequest>(): Action<FillOrderStageId, Request, EthereumTransaction> {
		return Action
			.create({
				id: "approve" as const,
				run: async (request: Request) => {
					if (!this.ethereum) {
						throw new Error("Wallet undefined")
					}
					if (this.isNonInvertableOrder(request.order)) {
						return { request, inverted: request.order }
					}
					const from = toAddress(await this.ethereum.getFrom())
					const inverted = await this.invertOrder(request, from)

					if (request.assetType && inverted.make.assetType.assetClass === "COLLECTION") {
						inverted.make.assetType = await this.checkAssetType(request.assetType)
						inverted.make.assetType = await this.checkLazyAssetType(inverted.make.assetType)
					}
					await this.approveOrder(inverted, Boolean(request.infinite))
					return { request, inverted }
				},
			})
			.thenStep({
				id: "send-tx" as const,
				run: async ({ inverted, request }: { inverted: SimpleOrder, request: Request }) => {
					this.checkStartEndDates(request.order)
					return this.sendTransaction(request, inverted)
				},
			})
	}

	/**
	 * @deprecated Use {@link buy} or {@link acceptBid} instead
	 */
	fill: FillOrderAction = this.getFillAction()

	/**
	 * Buy order
	 */
	public buy: BuyOrderAction = this.getFillAction<BuyOrderRequest>()

	/**
	 * Accept bid order
	 */
	public acceptBid: SellOrderAction = this.getFillAction<SellOrderRequest>()

	async getBuyTx({ request, from }: GetOrderBuyTxRequest): Promise<TransactionData> {
		if (!this.isNonInvertableOrder(request.order) && !from) {
			throw new Error("'From' field must be specified for this order type")
		}
		const inverted = this.isNonInvertableOrder(request.order) ? request.order : await this.invertOrder(request, from)
		if (request.assetType && inverted.make.assetType.assetClass === "COLLECTION") {
			inverted.make.assetType = await this.checkAssetType(request.assetType)
		}
		const { functionCall, options } = await this.getTransactionRequestData(
			request,
			inverted,
			{
				disableCheckingBalances: true,
			}
		)
		const callInfo = await functionCall.getCallInfo()
		const value = options.value?.toString() || "0"
		return {
			from,
			value,
			data: await functionCall.getData(),
			to: callInfo.contract,
		}
	}

	private async invertOrder(request: FillOrderRequest, from: Address) {
		switch (request.order.type) {
			case "RARIBLE_V1":
				return this.v1Handler.invert(<LegacyOrderFillRequest>request, from)
			case "RARIBLE_V2":
				return this.v2Handler.invert(<RaribleV2OrderFillRequest>request, from)
			case "OPEN_SEA_V1":
				return this.openSeaHandler.invert(<OpenSeaV1OrderFillRequest>request, from)
			case "SEAPORT_V1":
				throw new Error("Invert for Seaport orders is not implemented yet")
			case "X2Y2":
				throw new Error("Invert for x2y2 orders is not implemented yet")
			case "AMM":
				throw new Error("Invert for AMM orders is not implemented yet")
			case "CRYPTO_PUNK":
				return this.punkHandler.invert(<CryptoPunksOrderFillRequest>request, from)
			default:
				throw new Error(`Unsupported order: ${JSON.stringify(request)}`)
		}
	}

	private async approveOrder(inverted: SimpleOrder, isInfinite: boolean) {
		switch (inverted.type) {
			case "RARIBLE_V1":
				return this.v1Handler.approve(inverted, isInfinite)
			case "RARIBLE_V2":
				return this.v2Handler.approve(inverted, isInfinite)
			case "OPEN_SEA_V1":
				return this.openSeaHandler.approve(inverted, isInfinite)
			case "SEAPORT_V1":
				throw new Error("Approve for Seaport orders is not implemented yet")
			case "X2Y2":
				throw new Error("Approve for x2y2 orders is not implemented yet")
			case "AMM":
				throw new Error("Approve for AMM orders is not implemented yet")
			case "CRYPTO_PUNK":
				return this.punkHandler.approve(inverted, isInfinite)
			default:
				throw new Error(`Unsupported order: ${JSON.stringify(inverted)}`)
		}
	}

	private async sendTransaction(request: FillOrderRequest, inverted: SimpleOrder): Promise<EthereumTransaction> {
		const { functionCall, options } = await this.getTransactionRequestData(request, inverted)
		return this.send(
			functionCall, {
				...options,
				additionalData: getUpdatedCalldata(this.sdkConfig),
			})
	}

	private async getTransactionRequestData(
		request: FillOrderRequest,
		inverted: SimpleOrder,
		options?: { disableCheckingBalances?: boolean }
	): Promise<OrderFillSendData> {
		switch (request.order.type) {
			case "RARIBLE_V1":
				return this.v1Handler.getTransactionData(
          <SimpleLegacyOrder>request.order,
          <SimpleLegacyOrder>inverted,
          <LegacyOrderFillRequest>request
				)
			case "RARIBLE_V2":
				return this.v2Handler.getTransactionData(
          <SimpleRaribleV2Order>request.order,
          <SimpleRaribleV2Order>inverted,
				)
			case "OPEN_SEA_V1":
				return this.openSeaHandler.getTransactionData(
          <SimpleOpenSeaV1Order>request.order,
          <SimpleOpenSeaV1Order>inverted,
					<OpenSeaV1OrderFillRequest>request
				)
			case "SEAPORT_V1":
				return this.seaportHandler.getTransactionData(
          <SeaportV1OrderFillRequest>request,
          { disableCheckingBalances: options?.disableCheckingBalances }
				)
			case "LOOKSRARE":
				return this.looksrareHandler.getTransactionData(<LooksrareOrderFillRequest>request)
			case "LOOKSRARE_V2":
				return this.looksrareV2Handler.getTransactionData(<LooksrareOrderV2FillRequest>request)
			case "AMM":
				return this.ammHandler.getTransactionData(<AmmOrderFillRequest>request)
			case "X2Y2":
				return this.x2y2Handler.getTransactionData(<X2Y2OrderFillRequest>request)
			case "CRYPTO_PUNK":
				return this.punkHandler.getTransactionData(
          <SimpleCryptoPunkOrder>request.order,
          <SimpleCryptoPunkOrder>inverted,
				)
			default:
				throw new Error(`Unsupported request: ${JSON.stringify(request)}`)
		}
	}

	async getTransactionData(
		request: FillOrderRequest
	): Promise<OrderFillTransactionData> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const from = toAddress(await this.ethereum.getFrom())
		const inverted = this.isNonInvertableOrder(request.order) ? request.order : await this.invertOrder(request, from)
		if (request.assetType && inverted.make.assetType.assetClass === "COLLECTION") {
			inverted.make.assetType = await this.checkAssetType(request.assetType)
		}
		const { functionCall, options } = await this.getTransactionRequestData(request, inverted)

		const { contract } = await functionCall.getCallInfo()
		return {
			from,
			contract: toAddress(contract),
			data: await functionCall.getData(),
			options,
		}
	}

	async getOrderFee(order: SimpleOrder): Promise<number> {
		switch (order.type) {
			case "RARIBLE_V1":
				return this.v1Handler.getOrderFee(order)
			case "RARIBLE_V2":
				return this.v2Handler.getOrderFee(order)
			case "OPEN_SEA_V1":
				return this.openSeaHandler.getOrderFee(order)
			case "SEAPORT_V1":
				return this.seaportHandler.getOrderFee()
			case "LOOKSRARE":
				return this.looksrareHandler.getOrderFee()
			case "CRYPTO_PUNK":
				return this.punkHandler.getOrderFee()
			case "X2Y2":
				return this.x2y2Handler.getOrderFee()
			case "AMM":
				return this.ammHandler.getOrderFee()
			default:
				throw new Error(`Unsupported order: ${JSON.stringify(order)}`)
		}
	}

	async getBaseOrderFillFee(order: SimpleOrder): Promise<number> {
		switch (order.type) {
			case "RARIBLE_V1":
				return this.v1Handler.getBaseOrderFee()
			case "RARIBLE_V2":
				return this.v2Handler.getBaseOrderFee()
			case "OPEN_SEA_V1":
				return this.openSeaHandler.getBaseOrderFee()
			case "SEAPORT_V1":
				return this.seaportHandler.getBaseOrderFee()
			case "LOOKSRARE":
				return this.looksrareHandler.getBaseOrderFee()
			case "LOOKSRARE_V2":
				return this.looksrareV2Handler.getBaseOrderFee()
			case "CRYPTO_PUNK":
				return this.punkHandler.getBaseOrderFee()
			case "AMM":
				return this.ammHandler.getBaseOrderFee()
			case "X2Y2":
				return this.ammHandler.getBaseOrderFee()
			default:
				throw new Error(`Unsupported order: ${JSON.stringify(order)}`)
		}
	}

	checkStartEndDates(order: SimpleOrder) {
		const now = Date.now()
		if (order.start !== undefined && new Date(order.start * 1000).getTime() > now) {
			throw new Error(`Order will be actual since ${new Date(order.start * 1000)}, now ${new Date()}`)
		}
		if (order.end !== undefined && new Date(order.end * 1000).getTime() < now) {
			throw new Error(`Order was actual until ${new Date(order.end * 1000)}, now ${new Date()}`)
		}
	}

	async getBuyAmmInfo(request: GetAmmBuyInfoRequest): Promise<AmmTradeInfo> {
		const apis = await this.getApis()
		return apis.order.getAmmBuyInfo(request)
	}

	isNonInvertableOrder(order: SimpleOrder): boolean {
		return order.type === "SEAPORT_V1" ||
      order.type === "LOOKSRARE" ||
      order.type === "LOOKSRARE_V2" ||
      order.type === "X2Y2" ||
      order.type === "AMM"
	}
}
