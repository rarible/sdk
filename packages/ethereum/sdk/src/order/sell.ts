import type {
	Erc20AssetType,
	EthAssetType,
	Order,
	OrderForm,
	RaribleV2OrderForm,
} from "@rarible/ethereum-api-client"
import { toBigNumber } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"
import { Action } from "@rarible/action"
import type { HasOrder, HasPrice, OrderRequest, UpsertOrder } from "./upsert-order"
import type { AssetTypeRequest, AssetTypeResponse } from "./check-asset-type"
import type { SimpleOrder } from "./types"
import { isCurrency } from "./is-currency"

export type SellRequest = {
	makeAssetType: AssetTypeRequest
	amount: number
	takeAssetType: EthAssetType | Erc20AssetType
} & HasPrice & OrderRequest
export type SellOrderStageId = "approve" | "sign"
export type SellOrderAction = Action<SellOrderStageId, SellRequest, Order>
export type SellUpdateRequest = HasOrder & HasPrice

export type SellOrderUpdateAction = Action<SellOrderStageId, SellUpdateRequest, Order>

export class OrderSell {
	constructor(
		private readonly upserter: UpsertOrder,
		private readonly checkAssetType: (asset: AssetTypeRequest) => Promise<AssetTypeResponse>,
		private readonly checkWalletChainId: () => Promise<boolean>,
	) {}

	readonly sell: SellOrderAction = Action
		.create({
			id: "approve" as const,
			run: async (request: SellRequest) => {
				const form = await this.getSellForm(request)
				const checked = await this.upserter.checkLazyOrder(form) as OrderForm
				await this.upserter.approve(checked, false)
				return checked
			},
		})
		.thenStep({
			id: "sign" as const,
			run: (form: OrderForm) => this.upserter.upsertRequest(form),
		})
		.before(async (input: SellRequest) => {
			await this.checkWalletChainId()
			return input
		})

	private async getSellForm(request: SellRequest): Promise<RaribleV2OrderForm> {
		const price = await this.upserter.getPrice(request, request.takeAssetType)
		const form = await this.upserter.prepareOrderForm(request, true)
		return {
			...form,
			make: {
				assetType: await this.checkAssetType(request.makeAssetType),
				value: toBigNumber(request.amount.toString()),
			},
			take: {
				assetType: request.takeAssetType,
				value: toBigNumber(toBn(price).multipliedBy(request.amount).toString()),
			},
		}
	}

	readonly update: SellOrderUpdateAction = Action
		.create({
			id: "approve" as const,
			run: async (request: SellUpdateRequest) => {
				const order = await this.upserter.getOrder(request)
				if (!isCurrency(order.take.assetType)) {
					throw new Error(`Make asset type should be either ETH or ERC-20 asset, received=${order.make.assetType.assetClass}`)
				}
				if (order.type === "CRYPTO_PUNK") {
					return request
				} else {
					const price = await this.upserter.getPrice(request, order.take.assetType)
					const form = await this.prepareOrderUpdateForm(order, price)
					const checked = await this.upserter.checkLazyOrder(form) as OrderForm
					await this.upserter.approve(checked, false)
					return checked
				}
			},
		})
		.thenStep({
			id: "sign" as const,
			run: (form: OrderForm | SellUpdateRequest) => {
				if ("type" in form && (form.type === "RARIBLE_V1" || form.type === "RARIBLE_V2")) {
					return this.upserter.upsertRequest(form)
				}
				return this.upserter.updateCryptoPunkOrder(form)
			},
		})
		.before(async (input: SellUpdateRequest) => {
			await this.checkWalletChainId()
			return input
		})

	async prepareOrderUpdateForm(order: SimpleOrder, price: BigNumberValue): Promise<OrderForm> {
		if (order.type === "RARIBLE_V1" || order.type === "RARIBLE_V2") {
			return this.upserter.getOrderFormFromOrder(order, order.make, {
				assetType: order.take.assetType,
				value: toBigNumber(toBn(price).multipliedBy(order.make.value).toString()),
			})
		}
		throw new Error(`Unsupported order type: ${order.type}`)
	}
}
