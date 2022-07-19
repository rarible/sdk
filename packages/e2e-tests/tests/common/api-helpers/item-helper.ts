import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import type { BigNumber, ContractAddress, ItemId, UnionAddress } from "@rarible/types"
import { retry } from "@rarible/sdk/src/common/retry"
import type {
	CheckItemRestrictionResponse,
	GetAllItemsResponse,
	GetItemByIdResponse, GetItemRoyaltiesByIdResponse,
	GetItemsByCollectionResponse, GetItemsByCreatorResponse, GetItemsByOwnerResponse,
} from "@rarible/api-client/build/apis/ItemControllerApi"
import type { Blockchain, Items, Royalties } from "@rarible/api-client"
import type { RestrictionCheckResult } from "@rarible/api-client/build/models"

export async function awaitForItemSupply(sdk: IRaribleSdk, itemId: ItemId,
																				 supply: string | number | BigNumber
): Promise<string> {
	return retry(10, 2000, async () => {
		const item = await sdk.apis.item.getItemById({
			itemId,
		})
		const itemSupply = item.supply.toString()
		const requireSupply = supply.toString()
		if (itemSupply !== requireSupply) {
			throw new Error(`Expected supply ${requireSupply}, but current supply ${itemSupply}`)
		}
		return itemSupply
	})
}


export async function getItemByIdRaw(sdk: IRaribleSdk,
																		 itemId: ItemId): Promise<GetItemByIdResponse> {

	const item = await retry(10, 2000, async () => {
		return await sdk.apis.item.getItemByIdRaw({
			itemId,
		})
	})
	expect(item).not.toBe(null)
	return item
}


export async function getAllItems(
	sdk: IRaribleSdk,
	blockchains: Array<Blockchain>,
	size: number
): Promise<Items> {
	const items = await retry(10, 2000, async () => {
		return await sdk.apis.item.getAllItems({
			blockchains: blockchains,
			size: size,
		})
	})
	expect(items).not.toBe(null)
	return items
}


export async function getAllItemsRaw(sdk: IRaribleSdk, blockchains: Array<Blockchain>,
																		 size: number): Promise<GetAllItemsResponse> {
	const items = await retry(10, 2000, async () => {
		return await sdk.apis.item.getAllItemsRaw({
			blockchains: blockchains,
			size: size,
		})
	})
	expect(items).not.toBe(null)
	return items
}


export async function getItemsByCollection(sdk: IRaribleSdk, collection: string,
																					 size: number): Promise<Items> {
	const items = await retry(10, 2000, async () => {
		return await sdk.apis.item.getItemsByCollection({
			collection: collection,
			size: size,
		})
	})
	expect(items).not.toBe(null)
	return items
}


export async function getItemsByCollectionRaw(sdk: IRaribleSdk, collection: string,
	size: number): Promise<GetItemsByCollectionResponse> {
	const items = await retry(10, 2000, async () => {
		return await sdk.apis.item.getItemsByCollectionRaw({
			collection: collection,
			size: size,
		})
	})
	expect(items).not.toBe(null)
	return items
}


export async function getItemsByCreator(sdk: IRaribleSdk, creator: string,
	size: number): Promise<Items> {
	const items = await retry(10, 2000, async () => {
		return await sdk.apis.item.getItemsByCreator({
			creator: creator,
			size: size,
		})
	})
	expect(items).not.toBe(null)
	return items
}


export async function getItemsByCreatorRaw(sdk: IRaribleSdk, creator: string,
																					 size: number): Promise<GetItemsByCreatorResponse> {
	const items = await retry(10, 2000, async () => {
		return await sdk.apis.item.getItemsByCreatorRaw({
			creator: creator,
			size: size,
		})
	})
	expect(items).not.toBe(null)
	return items
}


export async function getItemsByOwner(sdk: IRaribleSdk, owner: string,
	size: number): Promise<Items> {
	const items = await retry(10, 2000, async () => {
		return await sdk.apis.item.getItemsByOwner({
			owner: owner,
			size: size,
		})
	})
	expect(items).not.toBe(null)
	return items
}


export async function getItemsByOwnerRaw(sdk: IRaribleSdk, owner: string,
																				 size: number): Promise<GetItemsByOwnerResponse> {
	const items = await retry(10, 2000, async () => {
		return await sdk.apis.item.getItemsByOwnerRaw({
			owner: owner,
			size: size,
		})
	})
	expect(items).not.toBe(null)
	return items
}


export async function getItemRoyaltiesById(sdk: IRaribleSdk, contract: ContractAddress,
																					 tokenId: BigNumber): Promise<Royalties> {
	const itemId = `${contract}:${tokenId}`
	const royalties = await retry(10, 2000, async () => {
		return await sdk.apis.item.getItemRoyaltiesById({
			itemId: itemId,
		})
	})
	expect(royalties).not.toBe(null)
	return royalties
}


export async function getItemRoyaltiesByIdRaw(sdk: IRaribleSdk, contract: ContractAddress,
																					 tokenId: BigNumber): Promise<GetItemRoyaltiesByIdResponse> {
	const itemId = `${contract}:${tokenId}`
	const royalties = await retry(10, 2000, async () => {
		return await sdk.apis.item.getItemRoyaltiesByIdRaw({
			itemId: itemId,
		})
	})
	expect(royalties).not.toBe(null)
	return royalties
}


export async function checkItemRestriction(sdk: IRaribleSdk, contract: ContractAddress,
																					 tokenId: BigNumber,
																					 user: UnionAddress): Promise<RestrictionCheckResult> {
	const itemId = `${contract}:${tokenId}`
	const restrictionCheckResult = await retry(10, 2000, async () => {
		return await sdk.apis.item.checkItemRestriction({
			itemId: itemId,
			restrictionCheckForm: {
				"@type": "OWNERSHIP",
				user: user,
			},
		})
	})
	expect(restrictionCheckResult).not.toBe(null)
	return restrictionCheckResult
}


export async function checkItemRestrictionRaw(sdk: IRaribleSdk, contract: ContractAddress,
	tokenId: BigNumber,
	user: UnionAddress): Promise<CheckItemRestrictionResponse> {
	const itemId = `${contract}:${tokenId}`
	const restrictionCheckResult = await retry(10, 2000, async () => {
		return await sdk.apis.item.checkItemRestrictionRaw({
			itemId: itemId,
			restrictionCheckForm: {
				"@type": "OWNERSHIP",
				user: user,
			},
		})
	})
	expect(restrictionCheckResult).not.toBe(null)
	return restrictionCheckResult
}

export async function verifyItemsByBlockchain(items: Items, blockchain: Blockchain): Promise<void> {
	items.items.forEach(i => {
		expect(i.blockchain).toEqual(blockchain)
	})
}

export async function verifyItemsContainsItem(items: Items, itemId: ItemId): Promise<void> {
	const ids = items.items.map(c => c.id)
	expect(ids).toContain(itemId)
}
