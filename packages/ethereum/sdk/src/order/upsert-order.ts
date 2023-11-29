// noinspection JSCommentMatchesSignature

import type {
	Asset,
	Binary,
	EthErc20AssetType,
	EthEthereumAssetType,
	EthRaribleV2OrderForm, UnionAddress,
} from "@rarible/api-client"
import type {
	OrderControllerApi,
	Order,
	OrderForm,
} from "@rarible/api-client"
import { Action } from "@rarible/action"
import type { Word, OrderId } from "@rarible/types"
import { randomWord, toBigNumber, toBinary, toWord } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { Payout } from "@rarible/api-client/build/models/Payout"
import type { EthRaribleV2OrderData } from "@rarible/api-client/build/models/OrderData"
import type { Blockchain } from "@rarible/api-client/build/models/Blockchain"
import { createCryptoPunksMarketContract } from "../nft/contracts/cryptoPunks"
import type { SendFunction } from "../common/send-transaction"
import { getRequiredWallet } from "../common/get-required-wallet"
import { waitTx } from "../common/wait-tx"
import { checkMinPaymentValue } from "../common/check-min-payment-value"
import { convertDateNumberToISO, ETHER_IN_WEI } from "../common"
import type { EthereumConfig } from "../config/type"
import { createUnionAddressWithChainId } from "../common/union-converters"
import { getBlockchainFromChainId } from "../common/get-blockchain-from-chain-id"
import type { SimpleCryptoPunkOrder, SimpleOrder, SimpleRaribleV2Order } from "./types"
import { addFee } from "./add-fee"
import type { ApproveFunction } from "./approve"
import type { OrderFiller } from "./fill-order"
import { createErc20Contract } from "./contracts/erc20"
import type { SellUpdateRequest } from "./sell"
import type { CheckLazyOrderType } from "./check-lazy-order"
import type { UpsertSimpleOrder } from "./types"

const ZERO = toWord("0x0000000000000000000000000000000000000000000000000000000000000000")

export type UpsertOrderStageId = "approve" | "sign"
export type UpsertOrderActionArg = {
	order: OrderForm
	infinite?: boolean
}

export type UpsertOrderForm = Omit<OrderForm, "make" | "take"> & {
	make: Asset
	take: Asset
}
export type UpsertOrderAction = Action<UpsertOrderStageId, UpsertOrderActionArg, Order>

export type HasOrder = { orderHash: OrderId } | { order: SimpleOrder }
export type HasPrice = { price: BigNumberValue } | { priceDecimal: BigNumberValue }

export type OrderRequestV2 = {
	type: "DATA_V2"
	maker?: UnionAddress
	payouts: Payout[]
	originFees: Payout[]
	start?: number
	end: number
}

export type OrderRequestV3Sell = {
	type: "DATA_V3_SELL"
	maker?: UnionAddress
	payout: Payout
	originFeeFirst?: Payout
	originFeeSecond?: Payout
	maxFeesBasePoint: number
	start?: number
	end: number
}

export type OrderRequestV3Buy = {
	type: "DATA_V3_BUY"
	maker?: UnionAddress
	payout?: Payout
	originFeeFirst?: Payout
	originFeeSecond?: Payout
	start?: number
	end: number
}

export type OrderRequest = OrderRequestV2 | OrderRequestV3Buy | OrderRequestV3Sell

export class UpsertOrder {
	constructor(
		private readonly orderFiller: OrderFiller,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
		public readonly checkLazyOrder: CheckLazyOrderType<OrderForm>,
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
				const checkedOrder = await this.checkLazyOrder(order)
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
			return this.orderApi.getValidatedOrderById({ id: hasOrder.orderHash }) as Promise<SimpleOrder>
		}
	}

	async getPrice(hasPrice: HasPrice, assetType: EthErc20AssetType | EthEthereumAssetType): Promise<BigNumberValue> {
		if ("price" in hasPrice) {
			return hasPrice.price
		} else {
			switch (assetType["@type"]) {
				case "ETH":
					return toBn(hasPrice.priceDecimal).multipliedBy(ETHER_IN_WEI)
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

	async approve(checkedOrder: OrderForm, infinite: boolean = false): Promise<EthereumTransaction | undefined> {
		const simple = UpsertOrder.orderFormToSimpleOrder(checkedOrder)
		const fee = await this.orderFiller.getOrderFee(simple)
		const make = addFee(checkedOrder.make, fee)
		const approveTx = this.approveFn(
			checkedOrder.maker,
			make,
			infinite
		)
		if (approveTx) {
			await waitTx(approveTx)
		}
		return approveTx
	}

	async upsertRequest(checked: OrderForm): Promise<Order> {
		const simple = UpsertOrder.orderFormToSimpleOrder(checked)
		checkMinPaymentValue(checked, this.config)
		return this.orderApi.upsertOrder({
			orderForm: {
				...checked,
				signature: await this.signOrder(simple),
			},
		})
	}

	async prepareOrderForm(request: OrderRequest, isMakeFill: boolean): Promise<Omit<EthRaribleV2OrderForm, "take" | "make">> {
		let data: EthRaribleV2OrderData
		switch (request.type) {
			case "DATA_V2":
				data = {
					"@type": "ETH_RARIBLE_V2_2",
					payouts: request.payouts,
					originFees: request.originFees,
					isMakeFill,
				}
				break
			case "DATA_V3_BUY":
				data = {
					"@type": "ETH_RARIBLE_V2_DATA_V3_BUY",
					payout: request.payout,
					originFeeFirst: request.originFeeFirst,
					originFeeSecond: request.originFeeSecond,
					marketplaceMarker: this.marketplaceMarker,
				}
				break
			case "DATA_V3_SELL":
				data = {
					"@type": "ETH_RARIBLE_V2_DATA_V3_SELL",
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

		const wallet = getRequiredWallet(this.ethereum)
		return {
			maker: await this.getOrderMaker(request),
			"@type": "RARIBLE_V2",
			data: data,
			salt: toBigNumber(toBn(randomWord(), 16).toString(10)),
			signature: toBinary("0x"),
			startedAt: convertDateNumberToISO(request.start),
			endedAt: convertDateNumberToISO(request.end)!,
			blockchain: getBlockchainFromChainId(await wallet.getChainId()) as Blockchain,
		}
	}

	private async getOrderMaker(request: OrderRequest): Promise<UnionAddress> {
		if (request.maker) {
			return request.maker
		} else {
			const wallet = await getRequiredWallet(this.ethereum)
			return createUnionAddressWithChainId(await wallet.getChainId(), await wallet.getFrom())
		}
	}

	static orderFormToSimpleOrder(form: OrderForm): UpsertSimpleOrder {
		return {
			...form,
			make: {
				type: form.make.assetType,
				value: form.make.value,
			},
			take: {
				type: form.take.assetType,
				value: form.take.value,
			},
			salt: toBinary(toBn(form.salt).toString(16)) as any,
		} as UpsertSimpleOrder
	}

	async updateCryptoPunkOrder(request: SellUpdateRequest): Promise<Order> {
		const order = await this.getOrder(request)
		if (order.data["@type"] !== "ETH_CRYPTO_PUNKS") {
			throw new Error(`can't update punk order with type: ${order.data["@type"]}`)
		}
		await this.updateCryptoPunkOrderByContract(
			getRequiredWallet(this.ethereum),
			order as SimpleCryptoPunkOrder,
			request
		)
		//todo fill lack of fields
		return order as Order
	}

	private async updateCryptoPunkOrderByContract(
		ethereum: Ethereum, order: SimpleCryptoPunkOrder, request: SellUpdateRequest
	) {
		const price = await this.getPrice(request, <EthEthereumAssetType>{})
		if (order.make.type["@type"] === "CRYPTO_PUNKS") {
			const ethContract = createCryptoPunksMarketContract(ethereum, order.make.type.contract)
			await this.send(ethContract.functionCall("offerPunkForSale", order.make.type.tokenId, price))
		} else if (order.take.type["@type"] === "CRYPTO_PUNKS") {
			const ethContract = createCryptoPunksMarketContract(ethereum, order.take.type.contract)
			await this.send(ethContract.functionCall("enterBidForPunk", order.take.type.tokenId), { value: price.toString() })
		} else {
			throw new Error("Crypto punks asset has not been found")
		}
	}
}

// function simpleToCryptoPunkOrder(order: SimpleCryptoPunkOrder): Order {
// 	return {
// 		...order,
// 		cancelled: false,
// 		createdAt: "",
// 		fill: toBigNumber("0"),
// 		hash: ZERO,
// 		lastUpdateAt: "",
// 		makeStock: order.make.value,
// 	}
// }
