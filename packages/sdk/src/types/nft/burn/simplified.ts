import type { BurnRequest, PrepareBurnRequest } from "./domain"
import type { BurnResponse } from "./domain"

export type IBurnSimplified = (request: BurnSimplifiedRequest) => Promise<BurnSimplifiedResponse>

export type BurnSimplifiedRequest = PrepareBurnRequest & BurnRequest
export type BurnSimplifiedResponse = BurnResponse
