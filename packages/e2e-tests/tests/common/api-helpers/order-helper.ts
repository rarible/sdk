import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import { retry } from "@rarible/sdk/src/common/retry"
import type { Orders } from "@rarible/api-client/build/models"
import type { BigNumber, ContractAddress } from "@rarible/types"
import type {
	GetOrderBidsByItemResponse,
	GetOrdersAllResponse,
	GetSellOrdersByItemResponse,
	GetSellOrdersByMakerResponse,
	GetSellOrdersResponse,
} from "@rarible/api-client/build/apis/OrderControllerApi"
import type { Blockchain } from "@rarible/api-client"


export async function getOrderBidsByItem(sdk: IRaribleSdk, contract: ContractAddress,
																				 tokenId: BigNumber, size: number): Promise<Orders> {
	const itemId = `${contract}:${tokenId}`
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getOrderBidsByItem({
			itemId: itemId,
			size: size,
		})
	})
	expect(orders).not.toBe(null)
	return orders
}


export async function getOrderBidsByItemRaw(sdk: IRaribleSdk,
	contract: ContractAddress, tokenId: BigNumber,
	size: number): Promise<GetOrderBidsByItemResponse> {
	const itemId = `${contract}:${tokenId}`
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getOrderBidsByItemRaw({
			itemId: itemId,
			size: size,
		})
	})
	expect(orders).not.toBe(null)
	return orders
}


export async function getOrdersAll(sdk: IRaribleSdk, blockchains: Array<Blockchain>,
																	 size: number): Promise<Orders> {
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getOrdersAll({
			blockchains: blockchains,
			size: size,
		})
	})
	expect(orders).not.toBe(null)
	return orders
}


export async function getOrdersAllRaw(sdk: IRaribleSdk, blockchains: Array<Blockchain>,
	size: number): Promise<GetOrdersAllResponse> {
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getOrdersAllRaw({
			blockchains: blockchains,
			size: size,
		})
	})
	expect(orders).not.toBe(null)
	return orders
}


export async function getOrdersByIds(sdk: IRaribleSdk, orderId: string): Promise<Orders> {
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getOrdersByIds({
			orderIds: {
				ids: [orderId],
			},
		})
	})
	expect(orders).not.toBe(null)
	return orders
}


export async function getOrdersByIdsRaw(sdk: IRaribleSdk, orderId: string): Promise<GetSellOrdersResponse> {
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getOrdersByIdsRaw({
			orderIds: {
				ids: [orderId],
			},
		})
	})
	expect(orders).not.toBe(null)
	return orders
}


export async function getSellOrders(sdk: IRaribleSdk, blockchains: Array<Blockchain>, size: number): Promise<Orders> {
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getSellOrders({
			blockchains: blockchains,
			size: size,
		})
	})
	expect(orders).not.toBe(null)
	return orders
}


export async function getSellOrdersRaw(sdk: IRaribleSdk, blockchains: Array<Blockchain>,
																			 size: number): Promise<GetSellOrdersResponse> {
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getSellOrdersRaw({
			blockchains: blockchains,
			size: size,
		})
	})
	expect(orders).not.toBe(null)
	return orders
}


export async function getSellOrdersByItem(sdk: IRaribleSdk,
	contract: ContractAddress, tokenId: BigNumber,
	size: number): Promise<Orders> {
	const itemId = `${contract}:${tokenId}`
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getSellOrdersByItem({
			itemId: itemId,
			size: size,
		})
	})
	expect(orders).not.toBe(null)
	return orders
}


export async function getSellOrdersByItemRaw(sdk: IRaribleSdk,
																						 contract: ContractAddress, tokenId: BigNumber,
																						 size: number): Promise<GetSellOrdersByItemResponse> {
	const itemId = `${contract}:${tokenId}`
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getSellOrdersByItemRaw({
			itemId: itemId,
			size: size,
		})
	})
	expect(orders).not.toBe(null)
	return orders
}


export async function getSellOrdersByMaker(sdk: IRaribleSdk, maker: string, size: number): Promise<Orders> {
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getSellOrdersByMaker({
			maker: maker,
			size: size,
		})
	})
	expect(orders).not.toBe(null)
	return orders
}


export async function getSellOrdersByMakerRaw(sdk: IRaribleSdk, maker: string,
	size: number): Promise<GetSellOrdersByMakerResponse> {
	const orders = await retry(10, 2000, async () => {
		return await sdk.apis.order.getSellOrdersByMakerRaw({
			maker: maker,
			size: size,
		})
	})
	expect(orders).not.toBe(null)
	return orders
}
