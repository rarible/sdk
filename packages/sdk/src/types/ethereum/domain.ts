import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import type { Action } from "@rarible/action"
import type { TransactionData } from "@rarible/protocol-ethereum-sdk/build/order/fill-order/types"
import type { UnionAddress } from "@rarible/types"
import type { PrepareFillRequest } from "../order/fill/domain"
import type { FillRequest } from "../order/fill/domain"

export type CryptopunkWrapRequest = {
  punkId: number
}

export type CryptopunkUnwrapRequest = {
  punkId: number
}

export type ICryptopunkWrap = Action<"approve-tx" | "wrap-tx", CryptopunkWrapRequest, IBlockchainTransaction>
export type ICryptopunkUnwrap = Action<"unwrap-tx", CryptopunkUnwrapRequest, IBlockchainTransaction>

export type IGetBuyTxData = (request: IGetBuyTxDataRequest) => Promise<TransactionData>
export type IGetBuyTxDataRequest = {
  request: FillRequest & PrepareFillRequest
  from?: UnionAddress
}
