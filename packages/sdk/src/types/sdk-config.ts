import type { WalletType } from "@rarible/sdk-wallet"
import type { AuthWithPrivateKey } from "@rarible/flow-sdk/build/types"
import type { AbstractLogger } from "@rarible/logger/build/domain"
import type * as ApiClient from "@rarible/api-client"
import type { ISolanaSdkConfig } from "../sdk-blockchains/solana/domain"
import type { IEthereumSdkConfig } from "../sdk-blockchains/ethereum/domain"
import type { Middleware } from "../common/middleware/middleware"
import type { LogsLevel } from "../common/logger/common"

export interface IRaribleSdkConfig {
	/**
	 * Parameters for requests to protocol API
	 */
	apiClientParams?: ApiClient.ConfigurationParameters
	/**
	 * Logging level
	 */
	logs?: LogsLevel
	/**
	 * Blockchain settings
	 */
	blockchain?: {
		[WalletType.SOLANA]?: ISolanaSdkConfig
		[WalletType.ETHEREUM]?: IEthereumSdkConfig
		[WalletType.FLOW]?: { auth: AuthWithPrivateKey }
	}
	/**
	 * Meddlewares
	 */
	middlewares?: Middleware[]
	apiKey?: string
	logger?: AbstractLogger
}
