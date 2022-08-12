import type { ApiResponse, HTTPHeaders, HTTPQuery } from "@rarible/ethereum-api-client"
import { BaseAPI, JSONApiResponse, RequiredError } from "@rarible/ethereum-api-client"

export interface GetImxUserStarkKeysRequest {
	address: string;
}

export interface GetImxUserStarkKeysResponse {
	accounts: string[]
}


export class ImxUserControllerApi extends BaseAPI {

	async getImxUserStarkKeysRaw(
		requestParameters: GetImxUserStarkKeysRequest,
	): Promise<ApiResponse<GetImxUserStarkKeysResponse>> {
		if (requestParameters.address === null || requestParameters.address === undefined) {
			throw new RequiredError("address", "Required parameter requestParameters.address was null or undefined when calling getImxUserStarkKeys.")
		}

		const queryParameters: HTTPQuery = {}

		const headerParameters: HTTPHeaders = {}

		const response = await this.request({
			path: "/users/{address}".replace(`{${"address"}}`, encodeURIComponent(String(requestParameters.address))),
			method: "GET",
			headers: headerParameters,
			query: queryParameters,
		})

		return new JSONApiResponse(response, (jsonValue) => jsonValue as GetImxUserStarkKeysResponse)

	}

	/**
	 */
	async getImxUserStarkKeys(requestParameters: GetImxUserStarkKeysRequest): Promise<GetImxUserStarkKeysResponse> {
		const response = await this.getImxUserStarkKeysRaw(requestParameters)
		return await response.value()
	}
}
