import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { Action } from "@rarible/action"

export type CryptopunkWrapRequest = {
	punkId: number
}

export type CryptopunkUnwrapRequest = {
	punkId: number
}

export type CryptopunkWrap = Action<"approve-tx" | "wrap-tx", CryptopunkWrapRequest, IBlockchainTransaction>
export type CryptopunkUnwrap = Action<"unwrap-tx", CryptopunkUnwrapRequest, IBlockchainTransaction>
