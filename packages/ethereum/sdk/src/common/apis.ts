import type * as EthereumApiClient from "@rarible/ethereum-api-client"
import * as ApiClient from "@rarible/api-client"
import { NetworkError } from "@rarible/logger/build"
import { getApiConfig } from "../config/api-config"
import type { EthereumNetwork } from "../types"

export type RaribleEthereumApis = {
	nftItem: ApiClient.ItemControllerApi;
	nftOwnership: ApiClient.OwnershipControllerApi;
	order: ApiClient.OrderControllerApi;
	orderActivity: ApiClient.ActivityControllerApi;
	orderSignature: ApiClient.SignatureControllerApi;
	nftCollection: ApiClient.CollectionControllerApi;
	balances: ApiClient.BalanceControllerApi;
	auction: ApiClient.AuctionControllerApi;
}

export function createEthereumApis(
	env: EthereumNetwork,
	params: EthereumApiClient.ConfigurationParameters = {}
): RaribleEthereumApis {
	const config = getApiConfig(env, {
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
		...params,
	})

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
		...params,
	})
	return {
		nftItem: new ApiClient.ItemControllerApi(configuration),
		nftOwnership: new ApiClient.OwnershipControllerApi(configuration),
		order: new ApiClient.OrderControllerApi(configuration),
		orderActivity: new ApiClient.ActivityControllerApi(configuration),
		orderSignature: new ApiClient.SignatureControllerApi(configuration),
		nftCollection: new ApiClient.CollectionControllerApi(configuration),
		balances: new ApiClient.BalanceControllerApi(configuration),
		auction: new ApiClient.AuctionControllerApi(configuration),
	}
}
