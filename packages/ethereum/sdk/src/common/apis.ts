import * as EthereumApiClient from "@rarible/ethereum-api-client"
import { NetworkError } from "@rarible/logger/build"
import type { GetValidatedOrderByHashRequest } from "@rarible/ethereum-api-client/build/apis/OrderControllerApi"
import type { Order } from "@rarible/ethereum-api-client/build/models"
import { getApiConfig } from "../config/api-config"
import type { EthereumNetwork } from "../types"
import { isNetworkError } from "./is-error"

export type RaribleEthereumApis = {
	nftItem: EthereumApiClient.NftItemControllerApi;
	nftOwnership: EthereumApiClient.NftOwnershipControllerApi;
	order: EthereumApiClient.OrderControllerApi;
	orderActivity: EthereumApiClient.OrderActivityControllerApi;
	orderSignature: EthereumApiClient.OrderSignatureControllerApi;
	nftCollection: EthereumApiClient.NftCollectionControllerApi;
	balances: EthereumApiClient.BalanceControllerApi;
	gateway: EthereumApiClient.GatewayControllerApi;
	nftLazyMint: EthereumApiClient.NftLazyMintControllerApi;
	auction: EthereumApiClient.AuctionControllerApi;
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
	const configuration = new EthereumApiClient.Configuration(config)
	const orderApi = new EthereumApiClient.OrderControllerApi(configuration)
	orderApi.getValidatedOrderByHash = async (req: GetValidatedOrderByHashRequest): Promise<Order> => {
		try {
			const response = await orderApi.getValidatedOrderByHashRaw(req)
			if (response.status === 200) {
				return response.value
			}
			throw response
		} catch (error: any) {
			if (isNetworkError(error) && error?.data?.code === "VALIDATION") {
				// eslint-disable-next-line no-throw-literal
				throw { url: error.url, data: error.data }
			}
			const errorObject = { ...error }
			if (errorObject && "status" in errorObject) {
				delete errorObject.status
			}
			throw errorObject
		}

	}
	return {
		nftItem: new EthereumApiClient.NftItemControllerApi(configuration),
		nftOwnership: new EthereumApiClient.NftOwnershipControllerApi(configuration),
		order: orderApi,
		orderActivity: new EthereumApiClient.OrderActivityControllerApi(configuration),
		orderSignature: new EthereumApiClient.OrderSignatureControllerApi(configuration),
		nftCollection: new EthereumApiClient.NftCollectionControllerApi(configuration),
		balances: new EthereumApiClient.BalanceControllerApi(configuration),
		gateway: new EthereumApiClient.GatewayControllerApi(configuration),
		nftLazyMint: new EthereumApiClient.NftLazyMintControllerApi(configuration),
		auction: new EthereumApiClient.AuctionControllerApi(configuration),
	}
}
