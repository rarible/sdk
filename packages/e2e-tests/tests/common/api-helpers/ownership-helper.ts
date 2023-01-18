import { retry } from "@rarible/sdk/src/common/retry"
import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { Ownership } from "@rarible/api-client/build/models"
import type { Blockchain, GetOwnershipByIdResponse } from "@rarible/api-client"
import type { BigNumber, ContractAddress, ItemId } from "@rarible/types"
import type { Ownerships } from "@rarible/api-client/build/models"
import type { GetOwnershipsByItem200 } from "@rarible/api-client/build/apis/OwnershipControllerApi"
import type {
	GetOwnershipsByItemResponse,
} from "@rarible/api-client/build/apis/OwnershipControllerApi"
import { Logger } from "../logger"


export async function getOwnershipById(sdk: IRaribleSdk, blockchain: Blockchain, contractAddress: string,
																			 tokenId: string, targetAddress: string): Promise<Ownership> {
	const ownership = await retry(10, 2000, async () => {
		return await sdk.apis.ownership.getOwnershipById({
			ownershipId: `${blockchain}:${contractAddress}:${tokenId}:${targetAddress}`,
		})
	})
	expect(ownership).not.toBe(null)
	return ownership
}

export async function awaitForOwnershipValue(
	sdk: IRaribleSdk,
	itemId: ItemId,
	recipientAddress: string,
	value?: BigNumber
): Promise<Ownership> {
	const ownershipId = `${itemId}:${recipientAddress}`
	Logger.log("Await for ownershipId", ownershipId)
	return await retry(15, 2000, async () => {
		const ownership = await sdk.apis.ownership.getOwnershipById({
			ownershipId: ownershipId,
		})
		expect(ownership).not.toBe(null)
		if (value) {
			expect(ownership.value).toBe(value)
		}
		return ownership
	})
}

export async function getOwnershipByIdRaw(sdk: IRaribleSdk, itemId: ItemId,
	recipientAddress: string): Promise<GetOwnershipByIdResponse> {
	const ownershipId = `${itemId}:${recipientAddress}`
	const ownership = await retry(10, 2000, async () => {
		return await sdk.apis.ownership.getOwnershipByIdRaw({
			ownershipId: ownershipId,
		})
	})
	expect(ownership.value as Ownership).not.toBe(null)
	Logger.log(ownership.value)
	return ownership
}

export async function getOwnershipsByItem(sdk: IRaribleSdk, contract: ContractAddress,
	tokenId: BigNumber): Promise<Ownerships> {
	const ownershipId = `${contract}:${tokenId}`
	const ownerships = await retry(10, 2000, async () => {
		return await sdk.apis.ownership.getOwnershipsByItem({
			itemId: ownershipId,
		})
	})
	expect(ownerships).not.toBe(null)
	return ownerships
}

export async function awaitOwnershipsByItem(sdk: IRaribleSdk, contract: ContractAddress,
										  tokenId: BigNumber, count: number): Promise<Ownerships> {
	return await retry(10, 2000, async () => {
		const ownerships = await getOwnershipsByItem(sdk, contract, tokenId)
		expect(ownerships.ownerships.length).toBeGreaterThanOrEqual(count)
		return ownerships
	})
}

export async function getOwnershipsByItemRaw(sdk: IRaribleSdk, contract: ContractAddress,
																						 tokenId: BigNumber): Promise<GetOwnershipsByItemResponse> {
	const ownershipId = `${contract}:${tokenId}`
	const ownerships = await retry(10, 2000, async () => {
		return await sdk.apis.ownership.getOwnershipsByItemRaw({
			itemId: ownershipId,
		})
	})
	expect(ownerships).not.toBe(null)
	return ownerships
}

export async function awaitOwnershipsByItemRaw(sdk: IRaribleSdk, contract: ContractAddress,
											 tokenId: BigNumber, count: number): Promise<GetOwnershipsByItemResponse> {
	return await retry(10, 2000, async () => {
		const ownershipAll = await getOwnershipsByItemRaw(sdk, contract, tokenId) as GetOwnershipsByItem200
		expect(ownershipAll.value).toBeGreaterThanOrEqual(count)
		return ownershipAll
	})
}
