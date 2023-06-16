// noinspection JSCommentMatchesSignature

import type {
	Binary,
	CryptoPunkOrder,
	Erc20AssetType,
	EthAssetType,
	Order,
	OrderControllerApi,
	OrderForm,
	Part,
	RaribleV2OrderForm,
} from "@rarible/ethereum-api-client"
import { Action } from "@rarible/action"
import type { Address, Word } from "@rarible/types"
import { randomWord, toAddress, toBigNumber, toBinary, toWord } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import type { OrderRaribleV2Data } from "@rarible/ethereum-api-client/build/models/OrderData"
import { toBn } from "@rarible/utils/build/bn"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import { createCryptoPunksMarketContract } from "../nft/contracts/cryptoPunks"
import type { SendFunction } from "../common/send-transaction"
import { getRequiredWallet } from "../common/get-required-wallet"
import { waitTx } from "../common/wait-tx"
import type { SimpleCryptoPunkOrder, SimpleOrder, UpsertSimpleOrder } from "./types"
import { addFee } from "./add-fee"
import type { ApproveFunction } from "./approve"
import type { OrderFiller } from "./fill-order"
import type { CheckLazyOrderPart } from "./check-lazy-order"
import { createErc20Contract } from "./contracts/erc20"
import type { SellUpdateRequest } from "./sell"

const ZERO = toWord("0x0000000000000000000000000000000000000000000000000000000000000000")

export type UpsertOrderStageId = "approve" | "sign"
export type UpsertOrderActionArg = {
	order: OrderForm
	infinite?: boolean
}
export type UpsertOrderAction = Action<UpsertOrderStageId, UpsertOrderActionArg, Order>

export type HasOrder = { orderHash: Word } | { order: SimpleOrder }
export type HasPrice = { price: BigNumberValue } | { priceDecimal: BigNumberValue }

export type OrderRequestV2 = {
	type: "DATA_V2"
	maker?: Address
	payouts: Part[]
	originFees: Part[]
	start?: number
	end?: number
}

export type OrderRequestV3Sell = {
	type: "DATA_V3_SELL"
	maker?: Address
	payout: Part
	originFeeFirst?: Part
	originFeeSecond?: Part
	maxFeesBasePoint: number
	start?: number
	end?: number
}

export type OrderRequestV3Buy = {
	type: "DATA_V3_BUY"
	maker?: Address
	payout?: Part
	originFeeFirst?: Part
	originFeeSecond?: Part
	start?: number
	end?: number
}

export type OrderRequest = OrderRequestV2 | OrderRequestV3Buy | OrderRequestV3Sell

export class UpsertOrder {
	constructor(
		private readonly orderFiller: OrderFiller,
		private readonly send: SendFunction,
		public readonly checkLazyOrder: (form: CheckLazyOrderPart) => Promise<CheckLazyOrderPart>,
		private readonly approveFn: ApproveFunction,
		private readonly signOrder: (order: SimpleOrder) => Promise<Binary>,
		private readonly orderApi: OrderControllerApi,
		private readonly ethereum: Maybe<Ethereum>,
		private readonly checkWalletChainId: () => Promise<boolean>,
		private readonly marketplaceMarker: Word | undefined
	) {}

	readonly upsert = Action
		.create({
			id: "approve" as const,
			run: async ({ order, infinite }: UpsertOrderActionArg) => {
				const checkedOrder = await this.checkLazyOrder(order) as OrderForm
				await this.approve(checkedOrder, infinite)
				return checkedOrder
			},
		})
		.thenStep({
			id: "sign" as const,
			run: (checked: OrderForm) => this.upsertRequest(checked),
		})
		.before(async (input: UpsertOrderActionArg) => {
			await this.checkWalletChainId()
			return input
		})

	async getOrder(hasOrder: HasOrder): Promise<SimpleOrder> {
		if ("order" in hasOrder) {
			return hasOrder.order
		} else {
			return this.orderApi.getValidatedOrderByHash({ hash: hasOrder.orderHash })
		}
	}

	async getPrice(hasPrice: HasPrice, assetType: Erc20AssetType | EthAssetType): Promise<BigNumberValue> {
		if ("price" in hasPrice) {
			return hasPrice.price
		} else {
			switch (assetType.assetClass) {
				case "ETH":
					return toBn(hasPrice.priceDecimal).multipliedBy(toBn(10).pow(18))
				case "ERC20":
					const decimals = await createErc20Contract(
						getRequiredWallet(this.ethereum),
						assetType.contract
					)
						.functionCall("decimals")
						.call()
					return toBn(hasPrice.priceDecimal).multipliedBy(toBn(10).pow(Number(decimals)))
				default:
					throw new Error(`Asset type should be either ETH or ERC-20, received=${JSON.stringify(assetType)}`)
			}
		}
	}

	async approve(checkedOrder: OrderForm, infinite: boolean = false): Promise<EthereumTransaction | undefined>  {
		const simple = UpsertOrder.orderFormToSimpleOrder(checkedOrder)
		const fee = await this.orderFiller.getOrderFee(simple)
		const make = addFee(checkedOrder.make, fee)
		const approveTx = this.approveFn(checkedOrder.maker, make, infinite)
		if (approveTx) {
			await waitTx(approveTx)
		}
		return approveTx
	}

	async upsertRequest(checked: OrderForm): Promise<Order> {
		const simple = UpsertOrder.orderFormToSimpleOrder(checked)
		return this.orderApi.upsertOrder({
			orderForm: {
				...checked,
				signature: await this.signOrder(simple),
			},
		})
	}

	async prepareOrderForm(request: OrderRequest, isMakeFill: boolean): Promise<Omit<RaribleV2OrderForm, "take" | "make">> {
		let data: OrderRaribleV2Data
		switch (request.type) {
			case "DATA_V2":
				data = {
					dataType: "RARIBLE_V2_DATA_V2",
					payouts: request.payouts,
					originFees: request.originFees,
					isMakeFill,
				}
				break
			case "DATA_V3_BUY":
				data = {
					dataType: "RARIBLE_V2_DATA_V3_BUY",
					payout: request.payout,
					originFeeFirst: request.originFeeFirst,
					originFeeSecond: request.originFeeSecond,
					marketplaceMarker: this.marketplaceMarker,
				}
				break
			case "DATA_V3_SELL":
				data = {
					dataType: "RARIBLE_V2_DATA_V3_SELL",
					payout: request.payout,
					originFeeFirst: request.originFeeFirst,
					originFeeSecond: request.originFeeSecond,
					marketplaceMarker: this.marketplaceMarker,
					maxFeesBasePoint: request.maxFeesBasePoint,
				}
				break
			default:
				throw new Error("Unknown OrderRequest type")
		}

		return {
			maker: await this.getOrderMaker(request),
			type: "RARIBLE_V2",
			data: data,
			salt: toBigNumber(toBn(randomWord(), 16).toString(10)),
			signature: toBinary("0x"),
			start: request.start,
			end: request.end,
		}
	}

	private async getOrderMaker(request: OrderRequest): Promise<Address> {
		if (request.maker) {
			return request.maker
		} else {
			return toAddress(await getRequiredWallet(this.ethereum).getFrom())
		}
	}

	static orderFormToSimpleOrder(form: OrderForm): SimpleOrder {
		return {
			...form,
			salt: toBinary(toBn(form.salt).toString(16)) as any,
		}
	}

	getOrderFormFromOrder<T extends UpsertSimpleOrder>(order: T, make: T["make"], take: T["take"]): OrderForm {
		return {
			...order,
			make,
			take,
			salt: toBigNumber(toBn(order.salt, 16).toString(10)),
			signature: order.signature || toBinary("0x"),
		}
	}

	async updateCryptoPunkOrder(request: SellUpdateRequest): Promise<Order> {
		const order = await this.getOrder(request)
		if (order.type !== "CRYPTO_PUNK") {
			throw new Error(`can't update punk order with type: ${order.type}`)
		}
		await this.updateCryptoPunkOrderByContract(getRequiredWallet(this.ethereum), order, request)
		return simpleToCryptoPunkOrder(order)
	}

	private async updateCryptoPunkOrderByContract(
		ethereum: Ethereum, order: SimpleCryptoPunkOrder, request: SellUpdateRequest
	) {
		const price = await this.getPrice(request, <EthAssetType>{})
		if (order.make.assetType.assetClass === "CRYPTO_PUNKS") {
			const ethContract = createCryptoPunksMarketContract(ethereum, order.make.assetType.contract)
			await this.send(ethContract.functionCall("offerPunkForSale", order.make.assetType.tokenId, price))
		} else if (order.take.assetType.assetClass === "CRYPTO_PUNKS") {
			const ethContract = createCryptoPunksMarketContract(ethereum, order.take.assetType.contract)
			await this.send(ethContract.functionCall("enterBidForPunk", order.take.assetType.tokenId), { value: price.toString() })
		} else {
			throw new Error("Crypto punks asset has not been found")
		}
	}
}

function simpleToCryptoPunkOrder(order: SimpleCryptoPunkOrder): CryptoPunkOrder {
	return {
		...order,
		cancelled: false,
		createdAt: "",
		fill: toBigNumber("0"),
		hash: ZERO,
		lastUpdateAt: "",
		makeStock: order.make.value,
	}
}
