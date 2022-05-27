import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { Action } from "@rarible/action"

export type CryptopunkWrapRequest = {
	punkId: number
}

export type CryptopunkUnwrapRequest = {
	punkId: number
}

export type ICryptopunkWrap = Action<"approve-tx" | "wrap-tx", CryptopunkWrapRequest, IBlockchainTransaction>
export type ICryptopunkUnwrap = Action<"unwrap-tx", CryptopunkUnwrapRequest, IBlockchainTransaction>
