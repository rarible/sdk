import { Action } from "@rarible/action"
// eslint-disable-next-line camelcase
import { bid, upsert_order, wrap } from "@rarible/tezos-sdk"
import BigNumber from "bignumber.js"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber, toContractAddress, toUnionAddress } from "@rarible/types"
// eslint-disable-next-line camelcase
import { pk_to_pkh } from "@rarible/tezos-sdk/dist/main"
import type { Order as TezosOrder } from "tezos-api-client/build"
import type { FTAssetType, XTZAssetType } from "@rarible/tezos-sdk"
import type { TezosProvider } from "@rarible/tezos-sdk/dist/common/base"
import type { OrderForm } from "@rarible/tezos-sdk/dist/order"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { TezosNetwork } from "@rarible/tezos-sdk/dist/common/base"
import type {
	OrderRequest,
	OrderUpdateRequest,
} from "../../types/order/common"
import type { RequestCurrency } from "../../common/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import { retry } from "../../common/retry"
import type { PrepareOrderUpdateRequest, PrepareOrderUpdateResponse } from "../../types/order/common"
import type { PrepareBidResponse } from "../../types/order/bid/domain"
import type { GetConvertableValueResult } from "../../types/order/bid/domain"
import type { PrepareBidRequest } from "../../types/order/bid/domain"
import type { ITezosAPI, MaybeProvider } from "./common"
import {
	convertFromContractAddress,
	convertOrderPayout,
	covertToLibAsset,
	getMakerPublicKey,
	getPayouts,
	getRequiredProvider,
	getSupportedCurrencies,
	getTezosItemData,
	getTezosOrderId,
	convertTezosOrderId,
	convertTezosToUnionAddress,
} from "./common"
import type { TezosBalance } from "./balance"

export class TezosBid {
	constructor(
		private provider: MaybeProvider<TezosProvider>,
		private apis: ITezosAPI,
		private balanceService: TezosBalance,
		private network: TezosNetwork,
	) {
		this.bid = this.bid.bind(this)
		this.update = this.update.bind(this)
		this.getConvertableValue = this.getConvertableValue.bind(this)
		this.convertCurrency = this.convertCurrency.bind(this)
	}

	getMakeAssetType(type: RequestCurrency): XTZAssetType | FTAssetType {
		switch (type["@type"]) {
			case "XTZ": {
				return {
					asset_class: type["@type"],
				}
			}
			case "TEZOS_FT": {
				return {
					asset_class: "FT",
					contract: convertFromContractAddress(type.contract),
					token_id: type.tokenId !== undefined ?  new BigNumber(type.tokenId) : undefined,
				}
			}
			default: {
				throw new Error("Unsupported take asset type")
			}
		}
	}

	private getConvertMap() {
		return {
			[convertTezosToUnionAddress(this.provider.config.wrapper)]: "XTZ",
		}
	}

	private async getConvertableValue(
		assetType: AssetType, value: BigNumberValue, walletAddress: UnionAddress
	): Promise<GetConvertableValueResult> {
		const convertMap = this.getConvertMap()

		if (assetType["@type"] === "TEZOS_FT" && assetType["contract"] in convertMap) {
			const wrappedTokenBalance = await this.balanceService.getBalance(walletAddress, assetType)

			if (new BigNumber(wrappedTokenBalance).gte(value)) {
				return undefined
			}

			const xtzBalance = await this.balanceService.getBalance(walletAddress, { "@type": "XTZ" })

			if (new BigNumber(xtzBalance).plus(wrappedTokenBalance).gte(value)) {
				return {
					type: "convertable",
					currency: { "@type": "XTZ" },
					value: new BigNumber(value).minus(wrappedTokenBalance),
				}
			}

			return {
				type: "insufficient",
				currency: { "@type": "XTZ" },
				value: new BigNumber(value).minus(xtzBalance),
			}
		}

		return undefined
	}

	async convertCurrency(request: OrderRequest | OrderUpdateRequest): Promise<void> {
		const convertMap = this.getConvertMap()
		const wXTZUnionAddress = toContractAddress(Object.keys(convertMap)[0])
		const provider = getRequiredProvider(this.provider)

		const convertableValue = await this.getConvertableValue(
			{ "@type": "TEZOS_FT", contract: wXTZUnionAddress },
			request.price,
			toUnionAddress(`TEZOS:${await provider.tezos.address()}`)
		)

		if (convertableValue === undefined) {
			return
		}
		if (convertableValue.type === "insufficient") {
			throw new Error("Insufficient XTZ funds")
		}

		if (convertableValue.type === "convertable") {
			const tx = await wrap(provider, new BigNumber(convertableValue.value))
			await tx.confirmation()
		}
	}

	async bid(prepare: PrepareBidRequest): Promise<PrepareBidResponse> {
		if ("collectionId" in prepare) {
			throw new Error("Bid collection is not supported")
		}
		const { itemId, contract } = getTezosItemData(prepare.itemId)

		const item = await retry(90, 1000, async () => {
			return this.apis.item.getNftItemById({ itemId })
		})
		const itemCollection = await this.apis.collection.getNftCollectionById({
			collection: contract,
		})

		const submit = Action.create({
			id: "convert" as const,
			run: async (request: OrderRequest) => {
				const convertMap = this.getConvertMap()
				const wXTZUnionAddress = toContractAddress(Object.keys(convertMap)[0])
				if (request.currency["@type"] === "TEZOS_FT" && request.currency.contract === wXTZUnionAddress) {
				  await this.convertCurrency(request)
				}
				return request
			},
		})
			.thenStep({
				id: "send-tx" as const,
				run: async (request: OrderRequest) => {
					const provider = getRequiredProvider(this.provider)
					const makerPublicKey = await getMakerPublicKey(provider)

					const order: TezosOrder = await bid(
						provider,
						{
							maker: pk_to_pkh(makerPublicKey),
							maker_edpk: makerPublicKey,
							make_asset_type: this.getMakeAssetType(request.currency),
							amount: new BigNumber(request.amount),
							take_asset_type: {
								asset_class: itemCollection.type,
								contract: item.contract,
								token_id: new BigNumber(item.tokenId),
							},
							price: new BigNumber(request.price),
							payouts: await getPayouts(provider, request.payouts),
							origin_fees: convertOrderPayout(request.originFees),
						}
					)

					return convertTezosOrderId(order.hash)
				},
			})

		return {
			multiple: itemCollection.type === "MT",
			maxAmount: toBigNumber(item.supply),
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			getConvertableValue: this.getConvertableValue,
			submit,
		}
	}

	async update(request: PrepareOrderUpdateRequest): Promise<PrepareOrderUpdateResponse> {
		const orderId = getTezosOrderId(request.orderId)

		const order = await this.apis.order.getOrderByHash({ hash: orderId })
		if (!order) {
			throw new Error("Order has not been found")
		}

		const updateAction = Action.create({
			id: "convert" as const,
			run: async (request: OrderUpdateRequest) => {
				await this.convertCurrency(request)
				return request
			},
		})
			.thenStep({
				id: "send-tx" as const,
				run: async (updateRequest: OrderUpdateRequest) => {
					const provider = getRequiredProvider(this.provider)

					const orderForm: OrderForm = {
						type: "RARIBLE_V2",
						maker: order.maker,
						maker_edpk: order.makerEdpk,
						taker_edpk: order.takerEdpk,
						make: {
							...covertToLibAsset(order.make),
							value: new BigNumber(updateRequest.price).multipliedBy(order.take.value),
						},
						take: covertToLibAsset(order.take),
						salt: order.salt,
						start: order.start,
						end: order.end,
						signature: order.signature,
						data: {
							data_type: "V1",
							payouts: order.data.payouts?.map(p => ({
								account: p.account,
								value: new BigNumber(p.value),
							})) || [],
							origin_fees: order.data.originFees?.map(p => ({
								account: p.account,
								value: new BigNumber(p.value),
							})) || [],
						},
					}
					const updatedOrder = await upsert_order(provider, orderForm, true, true)
					return convertTezosOrderId(updatedOrder.hash)
				},
			})

		return {
			originFeeSupport: OriginFeeSupport.FULL,
			payoutsSupport: PayoutsSupport.MULTIPLE,
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: parseInt(this.provider.config.fees.toString()),
			submit: updateAction,
		}
	}
}
