import type { Address, Binary } from "@rarible/ethereum-api-client"
import type { BigNumber } from "@rarible/types"

export enum OrderOpenSeaV1DataV1FeeMethod {
  PROTOCOL_FEE,
  SPLIT_FEE,
}

export enum OrderOpenSeaV1DataV1Side {
  BUY,
  SELL,
}

export enum OrderOpenSeaV1DataV1SaleKind {
  FIXED_PRICE,
  DUTCH_AUCTION,
}

export enum OrderOpenSeaV1DataV1HowToCall {
  CALL,
  DELEGATE_CALL,
}

export type OpenSeaOrderDTO = {
  exchange: Address
  maker: Address
  taker: Address
  makerRelayerFee: BigNumber
  takerRelayerFee: BigNumber
  makerProtocolFee: BigNumber
  takerProtocolFee: BigNumber
  feeRecipient: Address
  feeMethod: OrderOpenSeaV1DataV1FeeMethod
  side: OrderOpenSeaV1DataV1Side
  saleKind: OrderOpenSeaV1DataV1SaleKind
  target: Address
  howToCall: OrderOpenSeaV1DataV1HowToCall
  calldata: Binary
  replacementPattern: Binary
  staticTarget: Address
  staticExtradata: Binary
  paymentToken: Address
  basePrice: BigNumber
  extra: BigNumber
  listingTime: BigNumber
  expirationTime: BigNumber
  salt: BigNumber
}
