import * as ApiClient from "@rarible/api-client"
import type { ConfigurationParameters } from "@rarible/api-client"
import type { RaribleSdkEnvironment } from "../config/domain"
import type { IApisSdk } from "../domain"
import { getSdkConfig } from "../config"

export function createApisSdk(
	env: RaribleSdkEnvironment,
	params: ConfigurationParameters = {}
): IApisSdk {
	const config = getSdkConfig(env)
	const configuration = new ApiClient.Configuration({
		basePath: config.basePath,
		...params,
	})
	return {
		collection: new ApiClient.CollectionControllerApi(configuration),
		currency: new ApiClient.CurrencyControllerApi(configuration),
		auction: new ApiClient.AuctionControllerApi(configuration),
		item: new ApiClient.ItemControllerApi(configuration),
		ownership: new ApiClient.OwnershipControllerApi(configuration),
		order: new ApiClient.OrderControllerApi(configuration),
		activity: new ApiClient.ActivityControllerApi(configuration),
	}
}
