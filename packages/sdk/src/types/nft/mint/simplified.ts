import type { PrepareMintRequest } from "./prepare-mint-request.type"
import type { MintRequest } from "./mint-request.type"
import type { OnChainMintResponse, OffChainMintResponse } from "./domain"

export interface IMintSimplified {
	mintStart(request: MintSimplifiedRequestOnChain): Promise<OnChainMintResponse>
	mintStart(request: MintSimplifiedRequestOffChain): Promise<OffChainMintResponse>
}

export type MintSimplifiedRequest = MintSimplifiedRequestOnChain | MintSimplifiedRequestOffChain
export type MintSimplifiedRequestOnChain = MintRequest & PrepareMintRequest & {lazyMint?: false}
export type MintSimplifiedRequestOffChain = MintRequest & PrepareMintRequest & {lazyMint: true}
