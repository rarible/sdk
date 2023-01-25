import type { ConfigurationParameters } from "@rarible/api-client"
import * as ApiClient from "@rarible/api-client"
import type { Middleware, ResponseContext } from "@rarible/api-client/build/runtime"
import { handleFetchErrorResponse, NetworkError } from "@rarible/logger/build"
import type { RaribleSdkEnvironment } from "../config/domain"
import type { IApisSdk } from "../domain"
import { LogsLevel } from "../domain"
import { getSdkConfig } from "../config"

/**
 * @ignore
 * @param env
 * @param params
 * @param logsLevel
 */
export function createApisSdk(
	env: RaribleSdkEnvironment,
	params: ConfigurationParameters = {},
	logsLevel?: LogsLevel
): IApisSdk {
	const config = getSdkConfig(env)
	const configuration = new ApiClient.Configuration({
		basePath: config.basePath,
		headers: typeof params.apiKey === "string" ? { "X-API-KEY": params.apiKey } : {},
		exceptionHandler: async (error, url, init) => {
			throw new NetworkError({
				status: -1,
				url: decodeURIComponent(url),
				formData: init?.body?.toString(),
				method: init?.method,
				data: { message: error.message },
			})
		},
		middleware: [
			...(logsLevel !== LogsLevel.DISABLED
				? [getErrorHandlerMiddleware()]
				: []),
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
