import type { BurnRequest, PrepareBurnRequest } from "./domain"
import type { BurnResponse } from "./domain"

export type IBurnSimplified = (request: BurnSimplifiedRequest) => Promise<BurnResponse>

export type BurnSimplifiedRequest = PrepareBurnRequest & BurnRequest
