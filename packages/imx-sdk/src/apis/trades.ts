import type { ApiResponse, HTTPHeaders, HTTPQuery, Configuration } from "@rarible/ethereum-api-client"
import { BaseAPI, JSONApiResponse } from "@rarible/ethereum-api-client"

export interface GetTradesRequest {
  tokenType: string
  tokenAddress: string
  tokenId: string
}

export interface GetTradesResponse {
  result: {
    a: {
      order_id: number
      sold: string
      token_type: string
    }
    b: {
      order_id: number
      sold: string
      token_address: string
      token_id: string
      token_type: string
    }
    status: string
    timestamp: string
    transaction_id: number
  }[]
  cursor: string
}

export class ImxTradesControllerApi extends BaseAPI {
  constructor(configuration?: Configuration) {
    super(configuration)
  }
  async getTradesRaw(requestParameters: GetTradesRequest): Promise<ApiResponse<GetTradesResponse>> {
    const queryParameters: HTTPQuery = {}

    const headerParameters: HTTPHeaders = {}

    const response = await this.request({
      path:
        "/trades?party_b_token_type=" +
        encodeURIComponent(requestParameters.tokenType) +
        "&party_b_token_address=" +
        encodeURIComponent(requestParameters.tokenAddress) +
        "&party_b_token_id=" +
        encodeURIComponent(requestParameters.tokenId),
      method: "GET",
      headers: headerParameters,
      query: queryParameters,
    })

    return new JSONApiResponse(response, jsonValue => jsonValue as GetTradesResponse)
  }

  /**
   */
  async getTrades(requestParameters: GetTradesRequest): Promise<GetTradesResponse> {
    const response = await this.getTradesRaw(requestParameters)
    return await response.value()
  }
}
