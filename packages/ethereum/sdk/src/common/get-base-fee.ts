import { getStringifiedData } from "@rarible/sdk-common"
import type { EthereumNetwork } from "../types"
import type { SimpleOrder } from "../order/types"
import { CURRENT_ORDER_TYPE_VERSION } from "./order"
import type { RaribleEthereumApis } from "./apis"
import { retry } from "./retry"

export async function getBaseFee(
	env: EthereumNetwork,
	getApis: () => Promise<RaribleEthereumApis>,
	type: EnvFeeType = CURRENT_ORDER_TYPE_VERSION
): Promise<number> {
	const apis = await getApis()
	let envFeeConfig: Record<EnvFeeType, number>
	try {
		const fees = await retry(
			5, 3000, async () => await apis.orderSettings.getFees()
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
export type EnvFeeType = SimpleOrder["type"] | "AUCTION"
export type EnvFeeConfig = Record<EnvFeeType, number>
