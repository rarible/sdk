import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import { retry } from "@rarible/sdk/src/common/retry"
import type { Activities, ActivityType, UserActivityType } from "@rarible/api-client/build/models"
import type {
	GetActivitiesByCollectionResponse,
	GetActivitiesByItemResponse, GetActivitiesByUserResponse, GetAllActivitiesResponse,
} from "@rarible/api-client/build/apis/ActivityControllerApi"
import type { Blockchain } from "@rarible/api-client"


export async function getActivitiesByCollection(sdk: IRaribleSdk, collection: string,
	activityTypes: Array<ActivityType>): Promise<Activities> {

	const activities = await retry(10, 2000, async () => {
		return await sdk.apis.activity.getActivitiesByCollection({
			type: activityTypes,
			collection: collection,
		})
	})
	expect(activities).not.toBe(null)
	return activities
}


export async function getActivitiesByCollectionRaw(sdk: IRaribleSdk, collection: string,
	activityTypes: Array<ActivityType>): Promise<GetActivitiesByCollectionResponse> {

	const activities = await retry(10, 2000, async () => {
		return await sdk.apis.activity.getActivitiesByCollectionRaw({
			type: activityTypes,
			collection: collection,
		})
	})
	expect(activities).not.toBe(null)
	return activities
}


export async function getActivitiesByItem(sdk: IRaribleSdk, itemId: string,
	activityTypes: Array<ActivityType>): Promise<Activities> {

	const activities = await retry(10, 2000, async () => {
		return await sdk.apis.activity.getActivitiesByItem({
			type: activityTypes,
			itemId: itemId,
		})
	})
	expect(activities).not.toBe(null)
	return activities
}


export async function getActivitiesByItemRaw(sdk: IRaribleSdk, itemId: string,
	activityTypes: Array<ActivityType>): Promise<GetActivitiesByItemResponse> {

	const activities = await retry(10, 2000, async () => {
		return await sdk.apis.activity.getActivitiesByItemRaw({
			type: activityTypes,
			itemId: itemId,
		})
	})
	expect(activities).not.toBe(null)
	return activities
}


export async function getActivitiesByUser(sdk: IRaribleSdk, user: Array<string>,
	type: Array<UserActivityType>): Promise<Activities> {

	const activities = await retry(10, 2000, async () => {
		return await sdk.apis.activity.getActivitiesByUser({
			user: user,
			type: type,
		})
	})
	expect(activities).not.toBe(null)
	return activities
}


export async function getActivitiesByUserRaw(sdk: IRaribleSdk, user: Array<string>,
	type: Array<UserActivityType>): Promise<GetActivitiesByUserResponse> {

	const activities = await retry(10, 2000, async () => {
		return await sdk.apis.activity.getActivitiesByUserRaw({
			user: user,
			type: type,
		})
	})
	expect(activities).not.toBe(null)
	return activities
}


export async function getAllActivities(sdk: IRaribleSdk, blockchains: Array<Blockchain>,
	type: Array<ActivityType>): Promise<Activities> {

	const activities = await retry(10, 2000, async () => {
		return await sdk.apis.activity.getAllActivities({
			blockchains: blockchains,
			type: type,
		})
	})
	expect(activities).not.toBe(null)
	return activities
}


export async function getAllActivitiesRaw(sdk: IRaribleSdk, blockchains: Array<Blockchain>,
	type: Array<ActivityType>): Promise<GetAllActivitiesResponse> {

	const activities = await retry(10, 2000, async () => {
		return await sdk.apis.activity.getAllActivitiesRaw({
			blockchains: blockchains,
			type: type,
		})
	})
	expect(activities).not.toBe(null)
	return activities
}
