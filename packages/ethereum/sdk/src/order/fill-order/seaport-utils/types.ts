import type { BigNumberValue } from "@rarible/utils"
import type { BigNumber } from "@rarible/utils"
import type { SendFunction } from "../../../common/send-transaction"
import type { ItemType, OrderType } from "./constants"

export type OfferItem = {
  itemType: ItemType
  token: string
  identifierOrCriteria: string
  startAmount: string
  endAmount: string
}

export type ConsiderationItem = {
  itemType: ItemType
  token: string
  identifierOrCriteria: string
  startAmount: string
  endAmount: string
  recipient: string
}

export type Item = OfferItem | ConsiderationItem

export type OrderParameters = {
  offerer: string
  zone: string
  orderType: OrderType
  startTime: BigNumberValue
  endTime: BigNumberValue
  zoneHash: string
  salt: string
  offer: OfferItem[]
  consideration: ConsiderationItem[]
  totalOriginalConsiderationItems: BigNumberValue
  conduitKey: string
}

export type OrderComponents = OrderParameters & { counter: number | string }

export type Order = {
  parameters: OrderParameters
  signature: string
}

export type AdvancedOrder = Order & {
  numerator: string
  denominator: string
  extraData: string
}

export type BasicErc721Item = {
  itemType: ItemType.ERC721
  token: string
  identifier: string
}

export type Erc721ItemWithCriteria = {
  itemType: ItemType.ERC721
  token: string
  amount?: string
  endAmount?: string
} & ({ identifiers: string[] } | { criteria: string })

type Erc721Item = BasicErc721Item | Erc721ItemWithCriteria

export type BasicErc1155Item = {
  itemType: ItemType.ERC1155
  token: string
  identifier: string
  amount: string
  endAmount?: string
}

export type Erc1155ItemWithCriteria = {
  itemType: ItemType.ERC1155
  token: string
  amount: string
  endAmount?: string
} & ({ identifiers: string[] } | { criteria: string })

type Erc1155Item = BasicErc1155Item | Erc1155ItemWithCriteria

export type CurrencyItem = {
  token?: string
  amount: string
  endAmount?: string
}

export type CreateInputItem = Erc721Item | Erc1155Item | CurrencyItem

export type ConsiderationInputItem = CreateInputItem & { recipient?: string }

export type TipInputItem = CreateInputItem & { recipient: string }

export type Fee = {
  recipient: string
  basisPoints: number
}

export type CreateOrderInput = {
  send: SendFunction
  conduitKey?: string
  zone?: string
  startTime?: string
  endTime?: string
  offer: readonly CreateInputItem[]
  consideration: readonly ConsiderationInputItem[]
  counter?: number
  fees?: readonly Fee[]
  allowPartialFills?: boolean
  restrictedByZone?: boolean
  useProxy?: boolean
  salt?: string
}

export type InputCriteria = {
  identifier: string
  proof: string[]
}

export type OrderStatus = {
  isValidated: boolean
  isCancelled: boolean
  totalFilled: BigNumberValue
  totalSize: BigNumberValue
}

export type OrderWithCounter = {
  parameters: OrderComponents
  signature: string
}

export type FulfillmentComponent = {
  orderIndex: number
  itemIndex: number
}[]

export type Fulfillment = {
  offerComponents: FulfillmentComponent[]
  considerationComponents: FulfillmentComponent[]
}

type MatchOrdersFulfillmentComponent = {
  orderIndex: number
  itemIndex: number
}

export type MatchOrdersFulfillment = {
  offerComponents: MatchOrdersFulfillmentComponent[]
  considerationComponents: MatchOrdersFulfillmentComponent[]
}

export type AdditionalRecipientStruct = {
  amount: BigNumberValue
  recipient: string
}

export type AdditionalRecipientStructOutput = [BigNumber, string] & {
  amount: BigNumber
  recipient: string
}

export type BytesLike = ArrayLike<number> | string

export type BasicOrderParametersStruct = {
  considerationToken: string
  considerationIdentifier: BigNumberValue
  considerationAmount: BigNumberValue
  offerer: string
  zone: string
  offerToken: string
  offerIdentifier: BigNumberValue
  offerAmount: BigNumberValue
  basicOrderType: BigNumberValue
  startTime: BigNumberValue
  endTime: BigNumberValue
  zoneHash: BytesLike
  salt: BigNumberValue
  offererConduitKey: BytesLike
  fulfillerConduitKey: BytesLike
  totalOriginalAdditionalRecipients: BigNumberValue
  additionalRecipients: AdditionalRecipientStruct[]
  signature: BytesLike
}

export type FulfillmentComponentStruct = {
  orderIndex: BigNumberValue
  itemIndex: BigNumberValue
}[]

export type OrderParametersStruct = {
  offerer: string
  zone: string
  offer: OfferItemStruct[]
  consideration: ConsiderationItemStruct[]
  orderType: BigNumberValue
  startTime: BigNumberValue
  endTime: BigNumberValue
  zoneHash: BytesLike
  salt: BigNumberValue
  conduitKey: BytesLike
  totalOriginalConsiderationItems: BigNumberValue
}
export type OrderStruct = {
  parameters: OrderParametersStruct
  signature: BytesLike
}
export type OfferItemStruct = {
  itemType: BigNumberValue
  token: string
  identifierOrCriteria: BigNumberValue
  startAmount: BigNumberValue
  endAmount: BigNumberValue
}
export type ConsiderationItemStruct = {
  itemType: BigNumberValue
  token: string
  identifierOrCriteria: BigNumberValue
  startAmount: BigNumberValue
  endAmount: BigNumberValue
  recipient: string
}
