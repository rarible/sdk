import type { PrepareMintRequest } from "./prepare-mint-request.type"
import type { MintRequest } from "./mint-request.type"
import type { MintResponse } from "./domain"

export type IMintSimplified = (request: MintSimplifiedRequest) => Promise<MintResponse>

export type MintSimplifiedRequest = MintRequest & PrepareMintRequest
