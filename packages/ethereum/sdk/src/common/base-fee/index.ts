import type { BigNumber } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { EthereumNetwork } from "../../types"
import type { SimpleOrder } from "../../order/types"
import type { ApiService } from "../apis"

export type GetBaseFeeFn = (network: EthereumNetwork, type: EnvFeeType) => Promise<BigNumber>

export class BaseFeeService {
	constructor(private readonly getBaseFeeFn: GetBaseFeeFn) {}

	getBaseFee = async (network: EthereumNetwork, type: EnvFeeType) => {
		const value = await this.getBaseFeeFn(network, type)
		if (value.isNaN()) throw new UnexpectedBaseFeeError(network, type)
		return value.toNumber()
	}

	static fromApiService = (apiService: ApiService) =>
		new BaseFeeService(async (network, type) => {
			const apis = apiService.byNetwork(network)
			const response = await apis.orderSettings.getFees()
			return toBn(response.fees[type] ?? 0)
		})
}

export class UnexpectedBaseFeeError extends Error {
	constructor(network: EthereumNetwork, type: EnvFeeType) {
		super(`Can't parse base fee value on ${network} network for ${type}`)
		this.name = "UnexpectedBaseFeeError"
	}
}

// @todo once typescript will be added it should have array and
// that satisfies the union
export type EnvFeeType = SimpleOrder["type"] | "AUCTION"
