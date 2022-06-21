import type { PrepareMintRequest } from "./prepare-mint-request.type"
import type { MintRequest } from "./mint-request.type"
import type { OnChainMintResponse, OffChainMintResponse } from "./domain"

export interface IMintSimplified {
	mintStart(request: MintSimplifiedRequestOnChain): Promise<OnChainMintResponse>
	mintStart(request: MintSimplifiedRequestOffChain): Promise<OffChainMintResponse>
}

export type MintSimplifiedRequest = MintSimplifiedRequestOnChain | MintSimplifiedRequestOffChain
export type MintSimplifiedRequestOnChain = Omit<MintRequest, "lazyMint"> & PrepareMintRequest & {lazyMint?: false}
export type MintSimplifiedRequestOffChain = Omit<MintRequest, "lazyMint"> & PrepareMintRequest & {lazyMint: true}
