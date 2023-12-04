import type {
	EthEthereumAssetType,
	EthErc20AssetType,
	Order,
	OrderForm,
} from "@rarible/api-client"
import { toBigNumber, toBinary } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"
import { Action } from "@rarible/action"
import type { EthRaribleV2OrderForm } from "@rarible/api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import { isOrderV2 } from "../common/order"
import { convertDateNumberToISO } from "../common"
import { getRequiredWallet } from "../common/get-required-wallet"
import { getBlockchainFromChainId } from "../common/get-blockchain-from-chain-id"
import type { HasOrder, HasPrice, OrderRequest, UpsertOrder } from "./upsert-order"
import type { AssetTypeRequest, AssetTypeResponse } from "./check-asset-type"
import type { SimpleOrder } from "./types"
import { isCurrency } from "./is-currency"
import { convertAssetToEthForm } from "./convert-asset"

export type SellRequest = {
	makeAssetType: AssetTypeRequest
	amount: number
	takeAssetType: EthEthereumAssetType | EthErc20AssetType
} & HasPrice & OrderRequest
export type SellOrderStageId = "approve" | "sign"
export type SellOrderAction = Action<SellOrderStageId, SellRequest, Order>
export type SellUpdateRequest = HasOrder & HasPrice & { end?: number }

export type SellOrderUpdateAction = Action<SellOrderStageId, SellUpdateRequest, Order>

export class OrderSell {
	constructor(
		private readonly upserter: UpsertOrder,
		private readonly ethereum: Maybe<Ethereum>,
		private readonly checkAssetType: (asset: AssetTypeRequest) => Promise<AssetTypeResponse>,
		private readonly checkWalletChainId: () => Promise<boolean>,
	) {}

	readonly sell: SellOrderAction = Action
		.create({
			id: "approve" as const,
			run: async (request: SellRequest) => {
				const form = await this.getSellForm(request)
				const checked = await this.upserter.checkLazyOrder(form)
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

	private async getSellForm(request: SellRequest): Promise<EthRaribleV2OrderForm> {
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
				if (!isCurrency(order.take.type)) {
					throw new Error(`Make asset type should be either ETH or ERC-20 asset, received=${order.make.type["@type"]}`)
				}
				if (order.data["@type"] === "ETH_CRYPTO_PUNKS") {
					return { request, order }
				} else {
					const price = await this.upserter.getPrice(request, order.take.type)
					const form = await this.prepareOrderUpdateForm(order, request, price)
					const checked = await this.upserter.checkLazyOrder(form) as OrderForm
					await this.upserter.approve(checked, false)
					return { request, form: checked, order }
				}
			},
		})
		.thenStep({
			id: "sign" as const,
			run: ({ request, form, order }) => {
				if ("data" in order) {
					if (isOrderV2(order.data) && form) {
					  return this.upserter.upsertRequest(form)
					}
					if (order.data["@type"] === "ETH_CRYPTO_PUNKS") {
				    return this.upserter.updateCryptoPunkOrder(request, order)
					}
				}
				throw new Error(`Unrecognized order.data["@type"] = ${order.data["@type"]}`)
			},
		})
		.before(async (input: SellUpdateRequest) => {
			await this.checkWalletChainId()
			return input
		})

	async prepareOrderUpdateForm(
		order: SimpleOrder, request: SellUpdateRequest, price: BigNumberValue
	): Promise<OrderForm> {
		if (order.data["@type"] === "ETH_RARIBLE_V1" || isOrderV2(order.data)) {
			if (!request.end && !order.endedAt) {
				throw new Error("Order should contains 'end' field")
			}
			const chainId = await getRequiredWallet(this.ethereum).getChainId()
			return {
				...order,
				make: convertAssetToEthForm(order.make),
				take: {
					assetType: order.take.type,
					value: toBigNumber(toBn(price).multipliedBy(order.make.value).toString()),
				},
				salt: toBigNumber(toBn(order.salt, 16).toString(10)),
				signature: order.signature || toBinary("0x"),
				endedAt: (convertDateNumberToISO(request.end) || order.endedAt)!,
				blockchain: getBlockchainFromChainId(chainId),
				"@type": "RARIBLE_V2",
				data: order.data["@type"] === "ETH_RARIBLE_V1" ? {
					"@type": "ETH_RARIBLE_V2",
					payouts: [],
					originFees: [],
				} : order.data,
			}
		}
		throw new Error(`Unsupported order data type: ${order.data["@type"]}`)
	}
}
