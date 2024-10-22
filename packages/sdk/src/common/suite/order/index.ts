import type { Order } from "@rarible/api-client"
import { OrderStatus } from "@rarible/api-client"
import type { ItemId, OrderId } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import { subsetMatch } from "../../match-subset"
import { waitFor } from "../../wait-for"
import type { SuiteSupportedBlockchain } from "../domain"
import type { IRaribleSdk } from "../../../domain"
import type { OwnershipTestSuite } from "../ownership"
import { extractId } from "../../extract-blockchain"
import type { CreateTestOrderByItemRequest, CreateTestOrderByCollectionRequest } from "./domain"

export class OrderTestSuite<T extends SuiteSupportedBlockchain> {
  constructor(
    public readonly blockchain: T,
    private readonly sdk: IRaribleSdk,
    private readonly ownerships: OwnershipTestSuite,
  ) {}

  sellWithPrepare = async (request: CreateTestOrderByItemRequest) => {
    const response = await this.sdk.order.sell.prepare({ itemId: request.itemId })
    const price = toBn(request.price)
    const quantity = toBn(request.quantity || 1)

    const orderId = await response.submit({
      currency: request.currency,
      originFees: request.originFees,
      expirationDate: request.expiration || generateExpirationDate(),
      price: price.toString(),
      amount: quantity.toNumber(),
    })
    await this.waitOrderSubset(orderId, {
      makeStock: toBigNumber(quantity.toString()),
      makePrice: toBigNumber(price.toString()),
      status: OrderStatus.ACTIVE,
    })
    return orderId
  }

  sell = async (request: CreateTestOrderByItemRequest) => {
    const price = toBn(request.price)
    const quantity = toBn(request.quantity || 1)

    const orderId = await this.sdk.order.sell({
      itemId: request.itemId,
      currency: request.currency,
      originFees: request.originFees,
      expirationDate: request.expiration || generateExpirationDate(),
      price: price.toString(),
      amount: quantity.toNumber(),
    })
    await this.waitOrderSubset(orderId, {
      makeStock: toBigNumber(quantity.toString()),
      makePrice: toBigNumber(price.toString()),
      status: OrderStatus.ACTIVE,
    })
    return orderId
  }

  sellUpdate = async (orderId: OrderId, nextPrice: BigNumberValue) => {
    const prepared = await this.sdk.order.sellUpdate.prepare({ orderId })
    const order = await this.sdk.apis.order.getOrderById({ id: orderId })
    const updatedOrderId = await prepared.submit({ price: toBn(nextPrice).toString() })
    const nextPriceBn = toBn(nextPrice)
    const total = nextPriceBn.multipliedBy(order.make.value)

    await this.waitOrderSubset(orderId, {
      makePrice: toBigNumber(nextPrice.toString()),
      take: {
        value: toBigNumber(total.toString()),
        type: order.take.type,
      },
      status: OrderStatus.ACTIVE,
    })

    return updatedOrderId
  }

  bidWithPrepare = async (request: CreateTestOrderByItemRequest) => {
    const response = await this.sdk.order.bid.prepare({ itemId: request.itemId })
    const price = toBn(request.price)
    const quantity = toBn(request.quantity || 1)

    const orderId = await response.submit({
      currency: request.currency,
      originFees: request.originFees,
      expirationDate: request.expiration || generateExpirationDate(),
      price: price.toString(),
      amount: quantity.toNumber(),
    })
    await this.waitOrderSubset(orderId, {
      makeStock: toBigNumber(price.multipliedBy(quantity).toString()),
      status: OrderStatus.ACTIVE,
    })
    return orderId
  }

  bid = async (request: CreateTestOrderByItemRequest) => {
    const price = toBn(request.price)
    const quantity = toBn(request.quantity || 1)

    const orderId = await this.sdk.order.bid({
      itemId: request.itemId,
      currency: request.currency,
      originFees: request.originFees,
      expirationDate: request.expiration || generateExpirationDate(),
      price: price.toString(),
      amount: quantity.toNumber(),
    })
    await this.waitOrderSubset(orderId, {
      status: OrderStatus.ACTIVE,
    })
    return orderId
  }

  bidByCollection = async (request: CreateTestOrderByCollectionRequest) => {
    const price = toBn(request.price)
    const quantity = toBn(request.quantity || 1)

    const response = await this.sdk.order.bid.prepare({
      collectionId: request.collectionId,
    })
    const orderId = await response.submit({
      currency: request.currency,
      originFees: request.originFees,
      expirationDate: request.expiration || generateExpirationDate(),
      price: price.toString(),
      amount: quantity.toNumber(),
    })
    await this.waitOrderSubset(orderId, {
      makeStock: toBigNumber(price.multipliedBy(quantity).toString()),
      status: OrderStatus.ACTIVE,
    })
    return orderId
  }

  updateBidByPrepare = async (orderId: OrderId, nextPrice: BigNumberValue) => {
    const response = await this.sdk.order.bidUpdate.prepare({ orderId })
    const order = await this.sdk.apis.order.getOrderById({ id: orderId })
    const nextPriceBn = toBn(nextPrice)
    const total = nextPriceBn.multipliedBy(order.take.value)
    const updatedOrderId = await response.submit({
      price: nextPriceBn.toString(),
    })
    await this.waitOrderSubset(orderId, {
      takePrice: toBigNumber(nextPrice.toString()),
      make: {
        value: toBigNumber(total.toString()),
        type: order.make.type,
      },
      status: OrderStatus.ACTIVE,
    })
    return updatedOrderId
  }

  updateBid = async (orderId: OrderId, nextPrice: BigNumberValue) => {
    const updatedOrderId = await this.sdk.order.bidUpdate({
      orderId,
      price: toBn(nextPrice),
    })
    await this.waitOrderSubset(orderId, {
      makeStock: toBigNumber(nextPrice.toString()),
      status: OrderStatus.ACTIVE,
    })
    return updatedOrderId
  }

  acceptBid = async (itemId: ItemId, orderId: OrderId, quantity: BigNumberValue) => {
    const order = await this.sdk.apis.order.getOrderById({ id: orderId })
    const response = await this.sdk.order.acceptBid.prepare({ orderId })
    const quantityBn = toBn(quantity)
    const tx = await response.submit({
      amount: quantityBn.toNumber(),
      infiniteApproval: true,
      itemId,
    })
    await tx.wait()
    await this.ownerships.waitForNewOwnership(itemId, extractId(order.maker))
    const alreadyFilled = toBn(order.fill || 0)
    await this.waitOrderSubset(orderId, {
      fill: toBigNumber(quantityBn.plus(alreadyFilled).toString()),
    })
    const filled = alreadyFilled.plus(quantityBn)
    const remain = toBn(order.take.value).minus(filled)
    await this.waitOrderSubset(orderId, {
      status: remain.isGreaterThan(0) ? OrderStatus.ACTIVE : OrderStatus.FILLED,
      makeStock: toBigNumber(remain.multipliedBy(order.takePrice!).toString()),
    })
  }

  cancelOrder = async (orderId: OrderId) => {
    const tx = await this.sdk.order.cancel({ orderId })
    await tx.wait()
    await this.waitOrderSubset(orderId, {
      status: OrderStatus.CANCELLED,
      makeStock: toBigNumber("0"),
    })
  }

  waitOrder = async (orderHash: OrderId, predicate?: (value: Order) => boolean) => {
    return waitFor(() => this.sdk.apis.order.getOrderById({ id: orderHash }), predicate)
  }

  waitOrderSubset = async (orderHash: OrderId, subset: Partial<Order>) => {
    return this.waitOrder(orderHash, x => subsetMatch(x, subset))
  }

  waitStatus = async (orderHash: OrderId, status: OrderStatus) => {
    return this.waitOrderSubset(orderHash, { status })
  }
}

export function generateExpirationDate(seconds = 60 * 60) {
  return new Date(Date.now() + seconds * 1000)
}
