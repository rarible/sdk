import { Configuration } from "@rarible/ethereum-api-client"
import type { ImxEnv } from "@rarible/immutable-wallet"
import type { ConfigurationParameters } from "@rarible/ethereum-api-client/build/runtime"
import { IMX_ENV_CONFIG } from "../config/env"
import { ImxBalanceControllerApi } from "./balance"
import { ImxTradesControllerApi } from "./trades"

export function createApis(
	env: ImxEnv,
	apiParams: ConfigurationParameters = {}
): ImxApis {
	const { apiAddressV1, apiAddressV2 } = IMX_ENV_CONFIG[env]

	const configurationV1 = new Configuration({
		basePath: apiAddressV1,
		...apiParams,
	})
	const configurationV2 = new Configuration({
		basePath: apiAddressV2,
		...apiParams,
	})

	const trades = new ImxTradesControllerApi(configurationV1)
	const balance = new ImxBalanceControllerApi(configurationV2)

	return {
		balance,
		trades,
	}
}

export type ImxApis = {
	trades: ImxTradesControllerApi
	balance: ImxBalanceControllerApi
}
