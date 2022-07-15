import type { IRaribleSdk } from "@rarible/sdk/src/domain"
import { retry } from "@rarible/sdk/src/common/retry"
import type { Activities, UserActivityType } from "@rarible/api-client/build/models"
import type {
	GetActivitiesByCollectionResponse,
	GetActivitiesByItemResponse, GetActivitiesByUserResponse, GetAllActivitiesResponse,
} from "@rarible/api-client/build/apis/ActivityControllerApi"
import type { Blockchain } from "@rarible/api-client"
import type { ActivityType } from "@rarible/api-client"
import { Logger } from "../logger"


export async function getActivitiesByCollection(sdk: IRaribleSdk, collection: string,
	activityTypes: Array<ActivityType>): Promise<Activities> {

	const activities = await retry(10, 2000, async () => {
		return await sdk.apis.activity.getActivitiesByCollection({
			type: activityTypes,
			collection: [collection],
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
			collection: [collection],
		})
	})
	expect(activities).not.toBe(null)
	return activities
}


export async function getActivitiesByItem(sdk: IRaribleSdk, itemId: string,
	activityTypes: Array<ActivityType>,
	shouldPresent?: Array<ActivityType>): Promise<Activities> {
	Logger.log("Get activities, activityTypes=" + activityTypes + " ,shouldPresent=" + shouldPresent)
	return retry(15, 2000, async () => {
		const activities = await sdk.apis.activity.getActivitiesByItem({
			type: activityTypes,
			itemId: itemId,
		})
		expect(activities).not.toBe(null)
		if (typeof shouldPresent !== "undefined") {
			Logger.log(activities.activities)
			expect(activities.activities.map(a => a["@type"]).sort()).toEqual(shouldPresent.sort())
		}
		return activities
	})
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
