import type {
	AssetType as TezosAssetType, Provider,
	AssetType as TezosLibAssetType,
	Asset as TezosLibAsset,
} from "tezos-sdk-module/dist/common/base"
import { Action } from "@rarible/action"
import type { AssetType, Order, OrderId } from "@rarible/api-client"
import type {
	OrderForm, Part, Part as TezosPart,
} from "tezos-sdk-module/dist/order"
import TezosSDK from "tezos-sdk-module"
import type {
	BigNumber as RaribleBigNumber,
	Maybe,
} from "@rarible/types"
import {
	toBigNumber as toRaribleBigNumber,
	toOrderId,
	toBigNumber,
} from "@rarible/types"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import type {
	Order as TezosOrder,
	// AssetType as TezosAssetType
	Asset as TezosClientAsset,
	AssetType as TezosClientAssetType,
} from "tezos-api-client"
import BigNumber from "bignumber.js"
import type { TezosProvider } from "tezos-sdk-module/dist/common/base"
// eslint-disable-next-line camelcase
import { get_public_key } from "tezos-sdk-module/dist/common/base"
import type {
	FillRequest,
	PrepareFillRequest,
	PrepareFillResponse,
} from "../../types/order/fill/domain"
import {
	OriginFeeSupport,
	PayoutsSupport,
} from "../../types/order/fill/domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import { isExistedTezosProvider } from "./common"

export type PreparedOrder = OrderForm & { makeStock: RaribleBigNumber }

export class TezosFill {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
	) {
		this.fill = this.fill.bind(this)
	}

	private getRequiredProvider(): Provider {
		if (!isExistedTezosProvider(this.provider)) {
			throw new Error("Tezos provider is required")
		}
		return this.provider
	}

	static getTezosAssetTypeFromCommonType(type: TezosClientAssetType): TezosAssetType {
		switch (type.assetClass) {
			case "MT":
			case "NFT":
				return {
					asset_class: type.assetClass,
					contract: type.contract,
					token_id: new BigNumber(type.tokenId),
				}
			case "FT":
				return {
					asset_class: type.assetClass,
					contract: type.contract,
				}
			case "XTZ":
				return {
					asset_class: type.assetClass,
				}
			default:
				throw new Error("Invalid take asset type")
		}
	}

 	static getTezosAssetType(type: AssetType): TezosAssetType {
		switch (type["@type"]) {
			case "TEZOS_NFT":
			case "TEZOS_MT": {
				return {
					//todo fix types
					asset_class: type["@type"] as any,
					contract: type.contract,
					"token_id": new BigNumber(type.tokenId),
				}
			}
			case "XTZ": {
				return {
					asset_class: type["@type"],
				}
			}
			default: {
				throw new Error("Invalid take asset type")
			}
		}
	}

	convertToFillOrder(order: Order): PreparedOrder {
		if (order.data["@type"] !== "TEZOS_RARIBLE_V2") {
			throw new Error("Unsupported order data type")
		}

		return {
			type: "RARIBLE_V2",
			maker: order.maker,
			maker_edpk: order.data.makerEdpk!,
			taker: order.taker,
			taker_edpk: order.data.takerEdpk,
			make: {
				asset_type: TezosFill.getTezosAssetType(order.make.type),
				value: new BigNumber(order.make.value),
			},
			take: {
				asset_type: TezosFill.getTezosAssetType(order.make.type),
				value: new BigNumber(order.make.value),
			},
			salt: new BigNumber(order.salt),
			start: order.startedAt ? parseInt(order.startedAt) : undefined,
			end: order.endedAt ? parseInt(order.endedAt) : undefined,
			signature: order.signature,
			data: {
				data_type: "V1",
				payouts: this.convertOrderPayout(order.data.payouts),
				origin_fees: this.convertOrderPayout(order.data.originFees),
			},
			makeStock: toRaribleBigNumber(order.makeStock),
		}
	}

	convertToLibAsset(a: TezosClientAsset): TezosLibAsset {
		const factor = 1000000
		switch (a.assetType.assetClass) {
			case "XTZ": {
				return {
					asset_type: { asset_class: a.assetType.assetClass },
					value: new BigNumber(a.value).multipliedBy(factor),
				}
			}
			case "FT": {
				return {
					asset_type: {
						asset_class: a.assetType.assetClass,
						contract: a.assetType.contract,
					},
					value: new BigNumber(a.value).multipliedBy(factor),
				}
			}
			case "NFT": {
				return {
					asset_type: {
						asset_class: a.assetType.assetClass,
						contract: a.assetType.contract,
						token_id: new BigNumber(a.assetType.tokenId),
					},
					value: new BigNumber(1),
				}
			}
			case "MT":
				return {
					asset_type: {
						asset_class: a.assetType.assetClass,
						contract: a.assetType.contract,
						token_id: new BigNumber(a.assetType.tokenId),
					},
					value: new BigNumber(a.value),
				}
			default: throw new Error("Unknown Asset Class")
		}
	}

	async convertTezosOrderToForm(order: TezosOrder): Promise<PreparedOrder> {
		return {
			type: "RARIBLE_V2",
			maker: order.maker,
			maker_edpk: order.makerEdpk,
			make: this.convertToLibAsset(order.make),
			take: this.convertToLibAsset(order.take),
			salt: new BigNumber(order.salt),
			start: order.start,
			end: order.end,
			signature: order.signature,
			data: {
				data_type: "V1",
				payouts: this.convertOrderPayout(order.data.payouts),
				origin_fees: this.convertOrderPayout(order.data.originFees),
			},
			makeStock: toBigNumber(order.makeStock),
		}
	}

	convertOrderPayout(payout?: Array<Part> | Array<{account: string, value: number}>): Array<TezosPart> {
		return payout?.map(p => ({
			account: p.account,
			value: new BigNumber(p.value),
		})) || []
	}

	async getPreparedOrder(request: PrepareFillRequest): Promise<PreparedOrder> {
		if ("order" in request) {
			return this.convertToFillOrder(request.order)
		} else if ("orderId" in request) {
			if (!request.orderId.startsWith("TEZOS")) {
				throw new Error("Wrong tezos orderId")
			}
			const order = await this.apis.order.getOrderByHash({
				hash: toOrderId(request.orderId.substring(6)),
			})
			return this.convertTezosOrderToForm(order)
		} else {
			throw new Error("Request error")
		}
	}

	async getMaxAmount(order: PreparedOrder): Promise<RaribleBigNumber> {
		const provider = this.getRequiredProvider()
		if (order.take.asset_type.asset_class === "MT" || order.take.asset_type.asset_class === "NFT") {
			// eslint-disable-next-line camelcase
			const { contract, token_id } = order.take.asset_type
			const ownershipId = `${contract}:${token_id.toString()}:${await TezosSDK.get_address(provider)}`
			const response = await this.apis.ownership.getNftOwnershipById({
				ownershipId,
			})
			return toRaribleBigNumber(response.value)
		} else {
			return toRaribleBigNumber(order.makeStock)
		}
	}

	async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
		const provider = this.getRequiredProvider()
		let preparedOrder = await this.getPreparedOrder(request)

		const submit = Action.create({
			id: "send-tx" as const,
			run: async (fillRequest: FillRequest) => {
				const request = {
					amount: new BigNumber(fillRequest.amount),
					payouts: this.convertOrderPayout(fillRequest.payouts),
					origin_fees: this.convertOrderPayout(fillRequest.originFees),
					infinite: fillRequest.infiniteApproval,
					edpk: await get_public_key(provider),
				}
				const fillResponse = await TezosSDK.fill_order(
					provider,
					preparedOrder,
					request,
				)
				return new BlockchainTezosTransaction(fillResponse as any)
			},
		})

		return {
			multiple: false,
			maxAmount: await this.getMaxAmount(preparedOrder),
			baseFee: parseInt(provider.config.fees.toString()),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportsPartialFill: true,
			submit,
		}
	}

}
