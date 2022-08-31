import * as ApiClient from "@rarible/api-client"
import type { ConfigurationParameters } from "@rarible/api-client"
import type { ResponseContext } from "@rarible/api-client/build/runtime"
import type { Middleware } from "@rarible/api-client/build/runtime"
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
		middleware: [
			getErrorHandlerMiddleware(UnionAPIResponseError),
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
	// ErrorConstructor: typeof GeneralAPIResponseError = GeneralAPIResponseError
	ErrorConstructor: typeof GeneralAPIResponseError
): Middleware {
	return {
		post: async (context: ResponseContext) => {
			if (!context.response.ok) {
				const response = context.response.clone()
				let json = null
				try {
					json = await context.response.json()
				} catch (e) {}
				if (json) {
					throw new ErrorConstructor(
						response.status,
						decodeURIComponent(response.url),
						json
					)
				}
			}
			return context.response
		},
	}
}

export class GeneralAPIResponseError {
	constructor(
		public readonly status: number,
		public readonly url: string,
		public readonly value: any
	) {}
}

export class UnionAPIResponseError extends GeneralAPIResponseError {
	// eslint-disable-next-line unicorn/custom-error-definition
	constructor(status: number, url: string, value: any) {
		super(status, url, value)
	}
}

export class EthereumAPIResponseError extends GeneralAPIResponseError {
	// eslint-disable-next-line unicorn/custom-error-definition
	constructor(status: number, url: string, value: any) {
		super(status, url, value)
	}
}

export class FlowAPIResponseError extends GeneralAPIResponseError {
	// eslint-disable-next-line unicorn/custom-error-definition
	constructor(status: number, url: string, value: any) {
		super(status, url, value)
	}
}

export class ImxAPIResponseError extends GeneralAPIResponseError {
	// eslint-disable-next-line unicorn/custom-error-definition
	constructor(status: number, url: string, value: any) {
		super(status, url, value)
	}
}
