import type {
	EthErc20AssetType,
	EthEthereumAssetType,
	Order,
	OrderForm,
	EthRaribleV2OrderForm,
} from "@rarible/api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"
import { Action } from "@rarible/action"
import { toBigNumber, toBinary } from "@rarible/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Ethereum } from "@rarible/ethereum-provider"
import { convertDateNumberToISO } from "../common"
import { getBlockchainFromChainId } from "../common/get-blockchain-from-chain-id"
import { getRequiredWallet } from "../common/get-required-wallet"
import { isOrderV2 } from "../common/order"
import type { HasOrder, HasPrice, OrderRequest, UpsertOrder } from "./upsert-order"
import type { AssetTypeRequest, AssetTypeResponse } from "./check-asset-type"
import type { SimpleOrder } from "./types"
import { convertAssetToEthForm } from "./convert-asset"

export type BidRequest = {
	makeAssetType: EthEthereumAssetType | EthErc20AssetType
	amount: number
	takeAssetType: AssetTypeRequest
} & HasPrice & OrderRequest

export type BidOrderOrderStageId = "approve" | "sign"
export interface IBidResult {
	approveTx: EthereumTransaction | undefined
	order: Order
}

export type BidOrderAction = Action<BidOrderOrderStageId, BidRequest, IBidResult>

export type BidUpdateRequest = HasOrder & HasPrice & { end?: number }

export type BidUpdateOrderAction = Action<BidOrderOrderStageId, BidUpdateRequest, IBidResult>

export class OrderBid {
	constructor(
		private readonly upserter: UpsertOrder,
		private readonly ethereum: Maybe<Ethereum>,
		private readonly checkAssetType: (asset: AssetTypeRequest) => Promise<AssetTypeResponse>,
		private readonly checkWalletChainId: () => Promise<boolean>,
	) {}

	readonly bid: BidOrderAction = Action
		.create({
			id: "approve" as const,
			run: async (request: BidRequest) => {
				if (request.makeAssetType["@type"] !== "ERC20") {
					throw new Error(`Make asset type should be ERC-20, received=${request.makeAssetType["@type"]}`)
				}
				const form = await this.getBidForm(request)
				const checked = await this.upserter.checkLazyOrder(form)
				const approveTx = await this.upserter.approve(checked, true)
				return { checked, approveTx }
			},
		})
		.thenStep({
			id: "sign" as const,
			run: async (req: {checked: OrderForm, approveTx: EthereumTransaction | undefined}) => {
				return {
					approveTx: req.approveTx,
					order: await this.upserter.upsertRequest(req.checked),
				}
			},
		})
		.before(async (input: BidRequest) => {
			await this.checkWalletChainId()
			return input
		})

	readonly update: BidUpdateOrderAction = Action
		.create({
			id: "approve" as const,
			run: async (request: BidUpdateRequest) => {
				const order = await this.upserter.getOrder(request)
				if (order.data["@type"] === "ETH_CRYPTO_PUNKS") {
					return { request, order, approveTx: undefined }
				}
				if (order.make.type["@type"] !== "ERC20") {
					throw new Error(`Make asset type should be ERC-20, received=${order.make.type["@type"]}`)
				}
				const price = await this.upserter.getPrice(request, order.make.type)
				const form = await this.prepareOrderUpdateForm(order, request, price)
				const checked = await this.upserter.checkLazyOrder(form) as OrderForm
				const approveTx = await this.upserter.approve(checked, true)
				return { request, order, form: checked, approveTx }
			},
		})
		.thenStep({
			id: "sign" as const,
			run: async (req) => {
				if ("data" in req.order) {
					if (isOrderV2(req.order.data) && req.form) {
						return {
							approveTx: req.approveTx,
							order: await this.upserter.upsertRequest(req.form),
						}
					}
					if (req.order.data["@type"] === "ETH_CRYPTO_PUNKS") {
						return {
							approveTx: req.approveTx,
							order: await this.upserter.updateCryptoPunkOrder(req.request, req.order),
						}
					}
				}
				throw new Error(`Unrecognized order.data["@type"] = ${req.order.data["@type"]}`)
			},
		})
		.before(async (input: BidUpdateRequest) => {
			await this.checkWalletChainId()
			return input
		})

	private async getBidForm(request: BidRequest): Promise<EthRaribleV2OrderForm> {
		const form = await this.upserter.prepareOrderForm(request, false)
		const price = await this.upserter.getPrice(request, request.makeAssetType)
		return {
			...form,
			make: {
				assetType: request.makeAssetType,
				value: toBigNumber(toBn(price).multipliedBy(request.amount).toString()),
			},
			take: {
				assetType: await this.checkAssetType(request.takeAssetType),
				value: toBigNumber(request.amount.toString()),
			},
		}
	}

	async prepareOrderUpdateForm(
		order: SimpleOrder, request: BidUpdateRequest, price: BigNumberValue
	): Promise<OrderForm> {
		if (order.data["@type"] === "ETH_RARIBLE_V1" || isOrderV2(order.data)) {
			if (!request.end && !order.endedAt) {
				throw new Error("Order should contains 'end' field")
			}
			const chainId = await getRequiredWallet(this.ethereum).getChainId()
			return {
				...order,
				make: {
					assetType: order.take.type,
					value: toBigNumber(toBn(price).multipliedBy(order.take.value).toString()),
				},
				take: convertAssetToEthForm(order.take),
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
		throw new Error(`Unsupported order type: ${order.data["@type"]}`)
	}
}
