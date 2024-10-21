import type { CollectionId, ItemId, UnionAddress } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import type { RequestCurrencyAssetType } from "../../domain"

export type CreateTestOrderRequestCommon = {
  price: BigNumberValue
  quantity?: BigNumberValue
  expiration?: Date
  currency: RequestCurrencyAssetType
  originFees?: {
    account: UnionAddress
    value: number
  }[]
}

export type CreateTestOrderByItemRequest = CreateTestOrderRequestCommon & {
  itemId: ItemId
}

export type CreateTestOrderByCollectionRequest = CreateTestOrderRequestCommon & {
  collectionId: CollectionId
}
