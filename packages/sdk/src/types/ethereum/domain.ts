import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { Action } from "@rarible/action"
import type { GetOrderBuyTxRequest } from "@rarible/protocol-ethereum-sdk/src/order/fill-order/types"
import type { TransactionData } from "@rarible/protocol-ethereum-sdk/src/order/fill-order/types"

export type CryptopunkWrapRequest = {
  punkId: number
}

export type CryptopunkUnwrapRequest = {
  punkId: number
}

export type ICryptopunkWrap = Action<"approve-tx" | "wrap-tx", CryptopunkWrapRequest, IBlockchainTransaction>
export type ICryptopunkUnwrap = Action<"unwrap-tx", CryptopunkUnwrapRequest, IBlockchainTransaction>

export type IGetBuyTxData = (request: GetOrderBuyTxRequest) => Promise<TransactionData>
