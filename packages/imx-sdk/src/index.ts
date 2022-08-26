import type { Maybe } from "@rarible/types"
import type { ImxEnv } from "@rarible/immutable-wallet"
import type { Link } from "@imtbl/imx-sdk"
import type { RaribleImxSdk } from "./domain"
import { transfer } from "./nft/transfer"
import { buy, cancel, sell } from "./order"
import { burn } from "./nft/burn"
import { getProtocolFee } from "./common/get-protocol-fee"
import { getBalance } from "./balance/balance"
import type { Erc721AssetRequest } from "./nft/domain"
import type { ImxSdkConfig } from "./domain"
import { createApis } from "./apis"

export function createImxSdk(link: Maybe<Link>, environment: ImxEnv, config: ImxSdkConfig = {}): RaribleImxSdk {
	const apis = createApis(environment, config?.apiClientParams)
	return {
		nft: {
			transfer: transfer.bind(null, link),
			burn: burn.bind(null, link),
		},
		order: {
			sell: sell.bind(null, link),
			buy: buy.bind(null, environment, link, apis),
			cancel: cancel.bind(null, link),
			getOrderFee: getProtocolFee.bind(null, environment),
		},
		balance: {
			getBalance: getBalance.bind(null, environment, apis),
		},
	}
}

export { Erc721AssetRequest }
export { IMX_CONFIG, IMX_ENV_CONFIG } from "./config/env"
export { getBalance } from "./balance/balance"
