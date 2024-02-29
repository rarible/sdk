import type { Binary, CryptoPunkOrder, Erc20AssetType, EthAssetType, Order, OrderForm, RaribleV2OrderForm } from "@rarible/ethereum-api-client"
import { Action } from "@rarible/action"
import type { Address, Word } from "@rarible/types"
import { ZERO_WORD, toAddress, toBigNumber, toBinary } from "@rarible/types"
import type { OrderRaribleV2Data } from "@rarible/ethereum-api-client/build/models/OrderData"
import type { BigNumber } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import { createCryptoPunksMarketContract } from "../../nft/contracts/cryptoPunks"
import type { SendFunction } from "../../common/send-transaction"
import { getRequiredWallet } from "../../common/get-required-wallet"
import { checkMinPaymentValue } from "../../common/check-min-payment-value"
import type { RaribleEthereumApis } from "../../common/apis"
import { getPrice } from "../../common/get-price"
import type { SimpleCryptoPunkOrder, SimpleOrder } from "../types"
import { addFee } from "../add-fee"
import type { ApproveFunction } from "../approve"
import type { OrderFiller } from "../fill-order"
import type { CheckLazyOrderService } from "../check-lazy-order"
import type { SellUpdateRequest } from "../sell"
import type { HasOrder, HasPrice, OrderRequest, UpsertOrderActionArg } from "./domain"
import { generateOrderSalt, saltToBinary } from "./utils"

export class UpsertOrder {
	constructor(
		private readonly orderFiller: OrderFiller,
		private readonly send: SendFunction,
		private readonly checkLazyOrderService: CheckLazyOrderService,
		private readonly approveFn: ApproveFunction,
		private readonly signOrder: (order: SimpleOrder) => Promise<Binary>,
		private readonly getApis: () => Promise<RaribleEthereumApis>,
		private readonly ethereum: Maybe<Ethereum>,
		private readonly marketplaceMarker: Word | undefined
	) {}

	readonly upsert = Action
		.create({
			id: "approve" as const,
			run: async ({ order, infinite }: UpsertOrderActionArg) => {
				const checked = await this.checkLazyOrderService.check(order)
				await this.approve(checked, infinite)
				return checked
			},
		})
		.thenStep({
			id: "sign" as const,
			run: (checked: OrderForm) => this.upsertRequest(checked),
		})

	async getOrder(hasOrder: HasOrder): Promise<SimpleOrder> {
		if ("order" in hasOrder) {
			return hasOrder.order
		} else {
			const apis = await this.getApis()
			return apis.order.getValidatedOrderByHash({ hash: hasOrder.orderHash })
		}
	}

	async getPrice(hasPrice: HasPrice, assetType: Erc20AssetType | EthAssetType): Promise<BigNumber> {
		if ("price" in hasPrice) {
			return toBn(hasPrice.price)
		} else {
			const wallet = getRequiredWallet(this.ethereum)
			return getPrice(wallet, assetType, hasPrice.priceDecimal)
		}
	}

	async approve(order: OrderForm, infinite: boolean = false): Promise<EthereumTransaction | undefined> {
		const simple = toSimpleOrder(order)
		const fee = await this.orderFiller.getOrderFee(simple)
		const make = addFee(order.make, fee)
		const approveTx = await this.approveFn(order.maker, make, infinite)
		if (approveTx) {
			// Wait for transaction to be confirmed before signature
			await approveTx.wait()
		}
		return approveTx
	}

	async upsertRequest(order: OrderForm): Promise<Order> {
		const wallet = getRequiredWallet(this.ethereum)
		await checkMinPaymentValue(wallet, order)
		const apis = await this.getApis()
		const simple = toSimpleOrder(order)

		return apis.order.upsertOrder({
			orderForm: {
				...order,
				signature: await this.signOrder(simple),
			},
		})
	}


	async prepareOrderForm(request: OrderRequest, isMakeFill: boolean): Promise<Omit<RaribleV2OrderForm, "take" | "make">> {
		return {
			maker: await this.getOrderMaker(request),
			type: "RARIBLE_V2",
			data: this.prepareOrderData(request, isMakeFill),
			salt: generateOrderSalt(),
			signature: toBinary("0x"),
			start: request.start,
			end: request.end,
		}
	}

	private prepareOrderData(request: OrderRequest, isMakeFill: boolean): OrderRaribleV2Data {
		switch (request.type) {
			case "DATA_V2":
				return {
					dataType: "RARIBLE_V2_DATA_V2",
					payouts: request.payouts,
					originFees: request.originFees,
					isMakeFill,
				}
			case "DATA_V3_BUY":
				return {
					dataType: "RARIBLE_V2_DATA_V3_BUY",
					payout: request.payout,
					originFeeFirst: request.originFeeFirst,
					originFeeSecond: request.originFeeSecond,
					marketplaceMarker: this.marketplaceMarker,
				}
			case "DATA_V3_SELL":
				return {
					dataType: "RARIBLE_V2_DATA_V3_SELL",
					payout: request.payout,
					originFeeFirst: request.originFeeFirst,
					originFeeSecond: request.originFeeSecond,
					marketplaceMarker: this.marketplaceMarker,
					maxFeesBasePoint: request.maxFeesBasePoint,
				}
			default:
				throw new Error("Unknown OrderRequest type")
		}
	}

	private async getOrderMaker(request: OrderRequest): Promise<Address> {
		if (request.maker) {
			return request.maker
		} else {
			// In case when user doesn't provide an maker in request
			// we're rolling back to current connected wallet address
			const wallet = getRequiredWallet(this.ethereum)
			return toAddress(await wallet.getFrom())
		}
	}

	async updateCryptoPunkOrder(request: SellUpdateRequest): Promise<Order> {
		const wallet = getRequiredWallet(this.ethereum)
		const order = await this.getOrder(request)
		if (order.type !== "CRYPTO_PUNK") {
			throw new Error(`can't update punk order with type: ${order.type}`)
		}
		await this.updateCryptoPunkOrderByContract(wallet, order, request)
		return simpleToCryptoPunkOrder(order)
	}

	private async updateCryptoPunkOrderByContract(
		ethereum: Ethereum,
		order: SimpleCryptoPunkOrder,
		request: SellUpdateRequest
	) {
		const price = await this.getPrice(request, { assetClass: "ETH" })
		if (order.make.assetType.assetClass === "CRYPTO_PUNKS") {
			const ethContract = createCryptoPunksMarketContract(ethereum, order.make.assetType.contract)
			await this.send(ethContract.functionCall("offerPunkForSale", order.make.assetType.tokenId, price))
		}
		if (order.take.assetType.assetClass === "CRYPTO_PUNKS") {
			const ethContract = createCryptoPunksMarketContract(ethereum, order.take.assetType.contract)
			await this.send(ethContract.functionCall("enterBidForPunk", order.take.assetType.tokenId), {
				value: price.toString(),
			})
		}
		throw new Error("Crypto punks asset has not been found")
	}
}

function simpleToCryptoPunkOrder(order: SimpleCryptoPunkOrder): CryptoPunkOrder {
	return {
		...order,
		cancelled: false,
		createdAt: "",
		fill: toBigNumber("0"),
		hash: ZERO_WORD,
		lastUpdateAt: "",
		makeStock: order.make.value,
	}
}

function toSimpleOrder(form: OrderForm): SimpleOrder {
	return {
		...form,
		salt: saltToBinary(form.salt),
	}
}
