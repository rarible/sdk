import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import { Action } from "@rarible/action"
import type { Address, Asset, AssetType } from "@rarible/ethereum-api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import { BigNumber as BigNum, toBn } from "@rarible/utils"
import type { BigNumber } from "@rarible/types"
import { toAddress, toBigNumber } from "@rarible/types"
import type { SimpleOpenSeaV1Order, SimpleOrder, SimpleRaribleV2Order } from "../../types"
import type { SendFunction } from "../../../common/send-transaction"
import type { RaribleEthereumApis } from "../../../common/apis"
import type { CheckAssetTypeFunction } from "../../check-asset-type"
import { checkAssetType } from "../../check-asset-type"
import { checkLazyAssetType } from "../../check-lazy-asset-type"
import type { IRaribleEthereumSdkConfig } from "../../../types"
import type { EthereumNetwork } from "../../../types"
import type {
	AmmOrderFillRequest,
	FillBatchOrderAction,
	FillBatchOrderRequest,
	FillBatchSingleOrderRequest,
	FillOrderStageId, LooksrareOrderFillRequest, LooksrareOrderV2FillRequest,
	OpenSeaV1OrderFillRequest,
	OrderFillSendData,
	PreparedOrderRequestDataForExchangeWrapper,
	RaribleV2OrderFillRequest,
} from "../types"
import { RaribleV2OrderHandler } from "../rarible-v2"
import { OpenSeaOrderHandler } from "../open-sea"
import { SeaportOrderHandler } from "../seaport"
import { LooksrareOrderHandler } from "../looksrare"
import type { ComplexFeesReducedData } from "../common/origin-fee-reducer"
import { OriginFeeReducer } from "../common/origin-fee-reducer"
import { X2Y2OrderHandler } from "../x2y2"
import { AmmOrderHandler } from "../amm"
import { createExchangeWrapperContract } from "../../contracts/exchange-wrapper"
import type { SeaportV1OrderFillRequest } from "../types"
import type { X2Y2OrderFillRequest } from "../types"
import { getUpdatedCalldata } from "../common/get-updated-call"
import { getRequiredWallet } from "../../../common/get-required-wallet"
import { LooksrareV2OrderHandler } from "../looksrare-v2"
import { isErc20, isETH, isWeth } from "../../../nft/common"
import { pureApproveFn } from "../../approve"
import type { GetConfigByChainId } from "../../../config"

export class BatchOrderFiller {
	v2Handler: RaribleV2OrderHandler
	openSeaHandler: OpenSeaOrderHandler
	seaportHandler: SeaportOrderHandler
	looksrareHandler: LooksrareOrderHandler
	looksrareV2Handler: LooksrareV2OrderHandler
	x2Y2Handler: X2Y2OrderHandler
	ammHandler: AmmOrderHandler
	private checkAssetType: CheckAssetTypeFunction
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private checkLazyAssetType: (type: AssetType) => Promise<AssetType>

	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly getConfig: GetConfigByChainId,
		private readonly getApis: () => Promise<RaribleEthereumApis>,
		private readonly getBaseOrderFee: (type: SimpleOrder["type"]) => Promise<number>,
		private readonly env: EthereumNetwork,
		private readonly sdkConfig?: IRaribleEthereumSdkConfig
	) {
		this.v2Handler = new RaribleV2OrderHandler(ethereum, send, getConfig, getBaseOrderFee)
		this.openSeaHandler = new OpenSeaOrderHandler(ethereum, send, getConfig, getApis, getBaseOrderFee, sdkConfig)
		this.seaportHandler = new SeaportOrderHandler(ethereum, send, getConfig, getApis, getBaseOrderFee, env)
		this.looksrareHandler = new LooksrareOrderHandler(ethereum, send, getConfig, getBaseOrderFee, env, getApis)
		this.looksrareV2Handler = new LooksrareV2OrderHandler(
			ethereum,
			send,
			getConfig,
			getBaseOrderFee,
			env,
			getApis,
		)
		this.x2Y2Handler = new X2Y2OrderHandler(ethereum, send, getConfig, getBaseOrderFee, getApis)
		this.ammHandler = new AmmOrderHandler(ethereum, send, getConfig, getBaseOrderFee, getApis, env)
		this.checkAssetType = checkAssetType.bind(this, getApis)
		this.checkLazyAssetType = checkLazyAssetType.bind(this, getApis)
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
	}

	/**
	 * Convert origin fees & invert and approve orders
	 * @private
	 */
	private async prepareOrders(
		requests: FillBatchOrderRequest,
		feesReducer: OriginFeeReducer
	): Promise<PreparedOrder[]> {
		const from = toAddress(await getRequiredWallet(this.ethereum).getFrom())
		const config = await this.getConfig()

		const preparedOrders = await Promise.all(requests.map(async (request) => {
			if (!isWeth(request.order.take.assetType, config) && !isETH(request.order.take.assetType)) {
				throw new Error("Batch purchase is available only for ETH/WETH currencies")
			}
			let approveAsset: Asset | undefined

			if (
				request.order.type !== "RARIBLE_V2" &&
				request.order.type !== "OPEN_SEA_V1" &&
				request.order.type !== "LOOKSRARE" &&
				request.order.type !== "LOOKSRARE_V2" &&
				request.order.type !== "SEAPORT_V1" &&
				request.order.type !== "X2Y2" &&
				request.order.type !== "AMM"
			) {
				throw new Error("Unsupported order type for batch purchase")
			}

			const feesData = feesReducer.getComplexReducedFeesData(request.originFees)

			let inverted: SimpleOrder | undefined = undefined
			if (
				request.order.type === "RARIBLE_V2"
				// || request.order.type === "OPEN_SEA_V1"
			) {
				inverted = await this.invertOrder(request, from)
				if (request.assetType && inverted.make.assetType.assetClass === "COLLECTION") {
					inverted.make.assetType = await this.checkAssetType(request.assetType)
					inverted.make.assetType = await this.checkLazyAssetType(inverted.make.assetType)
				}
				approveAsset = await this.getApproveAsset(request, feesData, inverted)
			}

			if (request.order.type === "SEAPORT_V1") {
				approveAsset = await this.getApproveAsset(request, feesData, inverted)
			}

			return {
				request,
				inverted,
				fees: feesData.encodedFeesValue,
				approveAsset,
			}
		}))

		const totalInfiniteApproval = requests.every(request => !!request.infinite)

		//group erc-20 assets for approving by order.type
		const approveAssetsByOrderType = groupAssetsByOrderType(preparedOrders)
		//sum erc-20 assets
		for (const [orderType, assets] of approveAssetsByOrderType) {
			const erc20Assets = groupErc20AssetsByContract(assets)

			for (const [, erc20Asset] of erc20Assets) {
				//approve erc-20 tokens
				await this.approveErc20Asset(orderType, erc20Asset, totalInfiniteApproval)
			}
		}
		return preparedOrders
	}

	private async getApproveAsset(
		request: FillBatchSingleOrderRequest,
		feesData: ComplexFeesReducedData,
		inverted?: SimpleOrder
	) {
		switch (request.order.type) {
			case "RARIBLE_V2":
				return this.v2Handler.getAssetToApprove(inverted as SimpleRaribleV2Order)
			case "SEAPORT_V1":
				return this.seaportHandler.getAssetToApprove(request as SeaportV1OrderFillRequest, feesData)
			// case "OPEN_SEA_V1":
			// 	return this.openSeaHandler.getAssetToApprove(inverted)
			default:
				throw new Error(`Unsupported order: ${request.order.type}`)
		}
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

	private async approveErc20Asset(
		orderType: FillBatchSingleOrderRequest["order"]["type"],
		asset: Asset,
		isInfinite: boolean
	) {
		const wallet = getRequiredWallet(this.ethereum)
		const approveInput = {
			ethereum: wallet,
			send: this.send,
			owner: toAddress(await wallet.getFrom()),
			asset,
			infinite: isInfinite,
		}

		const config = await this.getConfig()

		switch (orderType) {
			case "RARIBLE_V2":
				return pureApproveFn({
					...approveInput,
					operator: config.transferProxies.erc20,
				})
			case "SEAPORT_V1":
				return pureApproveFn({
					...approveInput,
					operator: config.exchange.wrapper,
				})
			default:
				throw new Error(`Unsupported order: ${orderType}`)
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

		const config = await this.getConfig()

		const ordersCallData = await Promise.all(
			preparedOrders.map(async (preparedOrder) => {
				const requestData = await this.getOrderData(preparedOrder)
				totalValue = totalValue.plus(requestData.options?.value || 0)
				return requestData.data
			})
		)

		const wrapperContract = createExchangeWrapperContract(this.ethereum!, config.exchange.wrapper)
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
			value: totalValue.toFixed(),
			from: await getRequiredWallet(this.ethereum).getFrom(),
		})
		const gasLimitWithTheshold = toBn(gasLimit)
			.multipliedBy(1.1)
			.integerValue(BigNum.ROUND_FLOOR)
			.toNumber()

		return {
			functionCall,
			options: {
				value: totalValue.toFixed(),
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
			case "LOOKSRARE_V2":
				return this.looksrareV2Handler.getTransactionDataForExchangeWrapper(
					<LooksrareOrderV2FillRequest>preparedOrder.request,
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
	approveAsset?: Asset
}


function groupAssetsByOrderType<T extends PreparedOrder[]>(preparedOrders: T) {
	return preparedOrders.reduce((acc, { approveAsset, request }) => {
		if (approveAsset) {
			if (acc.has(request.order.type)) {
				const oldArray = acc.get(request.order.type) || []
				oldArray.push(approveAsset)
			} else {
				acc.set(request.order.type, [approveAsset])
			}
		}
		return acc
	}, new Map() as Map<FillBatchSingleOrderRequest["order"]["type"], Array<Asset>>)
}

function groupErc20AssetsByContract(assets: Asset[]) {
	return assets.reduce((acc, asset) => {
		if (isErc20(asset.assetType)) {
			const sumAsset = acc.get(asset.assetType.contract)
			if (sumAsset) {
				acc.set(
					asset.assetType.contract,
					{
						...sumAsset,
						value: toBigNumber(toBn(sumAsset.value).plus(asset.value).toFixed()),
					}
				)
			} else {
				acc.set(asset.assetType.contract, asset)
			}
		}
		return acc
	}, new Map() as Map<Address, Asset>)
}
