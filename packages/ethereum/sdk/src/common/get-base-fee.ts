import { getStringifiedData } from "@rarible/sdk-common"
import type { EthereumConfig } from "../config/type"
import type { EthereumNetwork } from "../types"
import { CURRENT_ORDER_TYPE_VERSION } from "./order"
import type { RaribleEthereumApis } from "./apis"
import { retry } from "./retry"
import { getUnionBlockchainFromChainId } from "./get-blockchain-from-chain-id"

export async function getBaseFee(
	config: EthereumConfig,
	env: EthereumNetwork,
	apis: RaribleEthereumApis,
	type: EnvFeeType = CURRENT_ORDER_TYPE_VERSION
): Promise<number> {
	let envFeeConfig: Record<EnvFeeType, number>
	try {
		const fees = await retry(
			5, 3000, async () => await apis.order.getOrderFees({
				blockchain: getUnionBlockchainFromChainId(config.chainId),
			})
		)
		envFeeConfig = fees.fees
	} catch (e) {
		let errorJson
		try {
			errorJson = getStringifiedData(e)
		} catch (e) {}
		throw new Error(`Getting fee error ${errorJson}`)
	}
	if (!envFeeConfig) {
		throw new Error(`Fee config was not found for ${env}`)
	}

	if (!(type in envFeeConfig)) {
		throw new Error(`Unsupported fee type ${type}`)
	}

	return Number(envFeeConfig[type] || 0)
}

export type CommonFeeConfig = Record<EthereumNetwork, EnvFeeConfig>
export type EnvFeeType = "RARIBLE_V1" | "RARIBLE_V2" | "OPEN_SEA_V1" | "SEAPORT_V1" | "CRYPTO_PUNK" | "X2Y2" | "LOOKSRARE" | "LOOKSRARE_V2" | "AMM"
export type EnvFeeConfig = Record<EnvFeeType, number>
