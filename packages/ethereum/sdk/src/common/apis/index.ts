import * as EthereumApiClient from "@rarible/ethereum-api-client"
import { NetworkError } from "@rarible/logger/build"
import { ethereumNetworks } from "../../types"
import type { IRaribleEthereumSdkConfig, EthereumNetwork } from "../../types"
import { getEthereumConfig } from "../../config"
import type { ConfigService } from "../config"

export class ApiService {
	private readonly dictionary: Record<EthereumNetwork, RaribleEthereumApis>
	readonly apis: RaribleEthereumApis

	constructor(
		readonly configService: ConfigService,
		readonly sdkConfig: IRaribleEthereumSdkConfig
	) {
		this.dictionary = ethereumNetworks.reduce((prev, curr) => {
			return {
				...prev,
				[curr]: createEthereumApis(curr, sdkConfig.apiKey, sdkConfig.apiClientParams),
			}
		}, {} as Record<EthereumNetwork, RaribleEthereumApis>)
		this.apis = this.dictionary[this.configService.defaultNetwork]
	}

	byNetwork = (network: EthereumNetwork) => this.dictionary[network]

	byCurrentWallet = async () => {
		if (this.configService.ethereum) {
			const currentNetwork = await this.configService.getCurrentNetwork()
			return this.byNetwork(currentNetwork)
		} else {
			return this.byNetwork(this.configService.defaultNetwork)
		}
	}
}

export function createEthereumApisByConfig(network: EthereumNetwork, sdkConfig: IRaribleEthereumSdkConfig = {}) {
	return createEthereumApis(network, sdkConfig.apiKey, sdkConfig.apiClientParams)
}

function createEthereumApis(
	network: EthereumNetwork,
	apiKey: string | undefined,
	additionalParams: EthereumApiClient.ConfigurationParameters = {}
) {
	const params = getEthereumApisParams(network, apiKey, additionalParams)
	const configuration = new EthereumApiClient.Configuration(params)
	return {
		network,
		nftItem: new EthereumApiClient.NftItemControllerApi(configuration),
		nftOwnership: new EthereumApiClient.NftOwnershipControllerApi(configuration),
		order: new EthereumApiClient.OrderControllerApi(configuration),
		orderActivity: new EthereumApiClient.OrderActivityControllerApi(configuration),
		orderSignature: new EthereumApiClient.OrderSignatureControllerApi(configuration),
		orderSettings: new EthereumApiClient.OrderSettingsControllerApi(configuration),
		nftCollection: new EthereumApiClient.NftCollectionControllerApi(configuration),
		balances: new EthereumApiClient.BalanceControllerApi(configuration),
		gateway: new EthereumApiClient.GatewayControllerApi(configuration),
		nftLazyMint: new EthereumApiClient.NftLazyMintControllerApi(configuration),
		auction: new EthereumApiClient.AuctionControllerApi(configuration),
	}
}

export type RaribleEthereumApis = ReturnType<typeof createEthereumApis>

function getEthereumApisParams(
	network: EthereumNetwork,
	apiKey: string | undefined,
	params: EthereumApiClient.ConfigurationParameters
): EthereumApiClient.ConfigurationParameters {
	const networkConfig = getEthereumConfig(network)
	return {
		basePath: networkConfig.basePath,
		headers: getEthereumApisHeaders(apiKey, params),
		exceptionHandler: (error, url, init) =>
			// @todo it shouldn't rely on error objects
			// of @rarible/logger package
			Promise.reject(new NetworkError({
				status: -1,
				url: decodeURIComponent(url),
				formData: init?.body?.toString(),
				method: init?.method,
				data: { message: error.message },
			})),
		...params,
	}
}

function getEthereumApisHeaders(
	apiKey: string | undefined,
	params: EthereumApiClient.ConfigurationParameters
) {
	const headers = { ...(params.headers || {}) }
	if (apiKey) {
		headers["X-API-KEY"] = apiKey
	}
	return headers
}
