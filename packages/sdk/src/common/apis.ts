import type { ConfigurationParameters } from "@rarible/api-client"
import * as ApiClient from "@rarible/api-client"
import type { ResponseContext } from "@rarible/api-client/build/runtime"
import type { Middleware } from "@rarible/api-client/build/runtime"
import { handleFetchErrorResponse } from "@rarible/logger/build"
import type { RaribleSdkEnvironment } from "../config/domain"
import type { IApisSdk } from "../domain"
import { getSdkConfig } from "../config"

/**
 * @ignore
 * @param env
 * @param params
 */
export function createApisSdk(
	env: RaribleSdkEnvironment,
	params: ConfigurationParameters = {}
): IApisSdk {
	const config = getSdkConfig(env)
	const configuration = new ApiClient.Configuration({
		basePath: config.basePath,
		middleware: [
			getErrorHandlerMiddleware(),
			...(params?.middleware || []),
		],
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

export function getErrorHandlerMiddleware(
	errorCode?: NetworkErrorCode
): Middleware {
	return {
		post: async (context: ResponseContext) => {
			await handleFetchErrorResponse(context.response, { code: errorCode })
			return context.response
		},
	}
}

export enum NetworkErrorCode {
	NETWORK_ERR = "NETWORK_ERR",
	ETHEREUM_NETWORK_ERR = "ETHEREUM_NETWORK_ERR",
	FLOW_NETWORK_ERR = "FLOW_NETWORK_ERR",
	IMX_NETWORK_ERR = "IMX_NETWORK_ERR",
	TEZOS_EXTERNAL_ERR = "TEZOS_EXTERNAL_ERR",
	SOLANA_EXTERNAL_ERR = "SOLANA_EXTERNAL_ERR",
	META_EXTERNAL_ERR = "META_EXTERNAL_ERR",
}
