import type { Erc20AssetType, EthAssetType, Order, OrderForm, RaribleV2OrderForm } from "@rarible/ethereum-api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"
import { Action } from "@rarible/action"
import { toBigNumber, toBinary } from "@rarible/types"
import type { HasOrder, HasPrice, OrderRequest, UpsertOrder } from "./upsert-order"
import type { AssetTypeRequest, AssetTypeResponse } from "./check-asset-type"
import type { SimpleOrder } from "./types"
import type { SellUpdateRequest } from "./sell"

export type BidRequest = {
  makeAssetType: EthAssetType | Erc20AssetType
  amount: number
  takeAssetType: AssetTypeRequest
} & HasPrice &
  OrderRequest

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
    private readonly checkAssetType: (asset: AssetTypeRequest) => Promise<AssetTypeResponse>,
  ) {}

  readonly bid: BidOrderAction = Action.create({
    id: "approve" as const,
    run: async (request: BidRequest) => {
      if (request.makeAssetType.assetClass !== "ERC20") {
        throw new Error(`Make asset type should be ERC-20, received=${request.makeAssetType.assetClass}`)
      }
      const form = await this.getBidForm(request)
      const checked = (await this.upserter.checkLazyOrder(form)) as OrderForm
      const approveTx = await this.upserter.approve(checked, true)
      return { checked, approveTx }
    },
  }).thenStep({
    id: "sign" as const,
    run: async (req: { checked: OrderForm; approveTx: EthereumTransaction | undefined }) => {
      return {
        approveTx: req.approveTx,
        order: await this.upserter.upsertRequest(req.checked),
      }
    },
  })

  readonly update: BidUpdateOrderAction = Action.create({
    id: "approve" as const,
    run: async (request: BidUpdateRequest) => {
      const order = await this.upserter.getOrder(request)
      if (order.type === "CRYPTO_PUNK") {
        return { form: request, approveTx: undefined }
      }
      if (order.make.assetType.assetClass !== "ERC20") {
        throw new Error(`Make asset type should be ERC-20, received=${order.make.assetType.assetClass}`)
      }
      const price = await this.upserter.getPrice(request, order.make.assetType)
      const form = await this.prepareOrderUpdateForm(order, request, price)
      const checked = (await this.upserter.checkLazyOrder(form)) as OrderForm
      const approveTx = await this.upserter.approve(checked, true)
      return { form: checked, approveTx }
    },
  }).thenStep({
    id: "sign" as const,
    run: async (req: { form: OrderForm | SellUpdateRequest; approveTx: EthereumTransaction | undefined }) => {
      if ("type" in req.form && (req.form.type === "RARIBLE_V1" || req.form.type === "RARIBLE_V2")) {
        return {
          approveTx: req.approveTx,
          order: await this.upserter.upsertRequest(req.form),
        }
      }
      return {
        approveTx: req.approveTx,
        order: await this.upserter.updateCryptoPunkOrder(req.form),
      }
    },
  })

  private async getBidForm(request: BidRequest): Promise<RaribleV2OrderForm> {
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
    order: SimpleOrder,
    request: BidUpdateRequest,
    price: BigNumberValue,
  ): Promise<OrderForm> {
    if (order.type === "RARIBLE_V1" || order.type === "RARIBLE_V2") {
      if (!request.end && !order.end) {
        throw new Error("Order should contains 'end' field")
      }
      return {
        ...order,
        make: {
          assetType: order.make.assetType,
          value: toBigNumber(toBn(price).multipliedBy(order.take.value).toString()),
        },
        salt: toBigNumber(toBn(order.salt, 16).toString(10)),
        signature: order.signature || toBinary("0x"),
        end: (request.end || order.end)!,
      }
    }
    throw new Error(`Unsupported order type: ${order.type}`)
  }
}
