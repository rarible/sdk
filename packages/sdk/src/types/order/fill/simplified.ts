import type { PrepareFillRequest, PrepareFillResponse } from "./domain"

export type IFillSimplified = (request: PrepareFillRequest) => Promise<PrepareFillResponse>
