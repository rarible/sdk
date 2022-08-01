import type { BigNumberT } from "@imtbl/imx-sdk"
import type { ApiResponse, HTTPHeaders, HTTPQuery } from "@rarible/ethereum-api-client"
import { BaseAPI, JSONApiResponse, RequiredError } from "@rarible/ethereum-api-client"

export interface GetAllBalancesRequest {
	ownerAddress: string;
}

export interface GetAllBalancesResponse {
	"result": {
		"symbol": string,
		"balance": BigNumberT,
		"preparing_withdrawal": string,
		"withdrawable": string
	}[],
	"cursor": string
}


export class ImxBalanceControllerApi extends BaseAPI {

	async getAllBalancesRaw(
		requestParameters: GetAllBalancesRequest,
	): Promise<ApiResponse<GetAllBalancesResponse>> {
		if (requestParameters.ownerAddress === null || requestParameters.ownerAddress === undefined) {
			throw new RequiredError("ownerAddress", "Required parameter requestParameters.ownerAddress was null or undefined when calling getAllBalances.")
		}

		const queryParameters: HTTPQuery = {}

		const headerParameters: HTTPHeaders = {}

		const response = await this.request({
			path: "/balances/{address}".replace(`{${"address"}}`, encodeURIComponent(String(requestParameters.ownerAddress))),
			method: "GET",
			headers: headerParameters,
			query: queryParameters,
		})

		return new JSONApiResponse(response, (jsonValue) => jsonValue as GetAllBalancesResponse)

	}

	/**
	 */
	async getAllBalances(requestParameters: GetAllBalancesRequest): Promise<GetAllBalancesResponse> {
		const response = await this.getAllBalancesRaw(requestParameters)
		return await response.value()
	}
}
