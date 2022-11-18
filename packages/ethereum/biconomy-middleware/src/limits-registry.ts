import { handleFetchErrorResponse, NetworkError } from "@rarible/logger/build"
import type { BiconomyApiLimitResponse, ILimitsRegistry } from "./types"
import { NetworkErrorCode } from "./domain"

const API_URL = "https://api.biconomy.io/api/v1/dapp/checkLimits"

type LimitsRegistryProps = {
	apiId: string // dapp name from biconomy's dashboard
	apiKey: string
}
export class LimitsRegistry implements ILimitsRegistry {
	constructor(private readonly options: LimitsRegistryProps) {}

	async checkLimits(userAddress: string): Promise<BiconomyApiLimitResponse> {
		const fetchUrl = `${API_URL}?userAddress=${userAddress}&apiId=${this.options.apiId}`
		let response
		try {
			response = await fetch(fetchUrl, {
				headers: new Headers({
					"x-api-key": this.options.apiKey,
				}),
			})
		} catch (e) {
			throw new NetworkError({
				url: fetchUrl,
				data: (e as Error).message,
				code: NetworkErrorCode.BICONOMY_EXTERNAL_ERR,
			})
		}
		await handleFetchErrorResponse(response, { code: NetworkErrorCode.BICONOMY_EXTERNAL_ERR })
		return response.json()
	}
}
