import type {
  CryptoPunkOrder,
  LegacyOrder,
  OpenSeaV1Order,
  RaribleV2Order,
  X2Y2Order,
  LooksRareOrder,
  SeaportV1Order,
  AmmOrder,
} from "@rarible/ethereum-api-client"
import type { LooksRareV2Order } from "@rarible/ethereum-api-client/build/models/Order"

export type SimpleLegacyOrder = Pick<
  LegacyOrder,
  "data" | "maker" | "taker" | "make" | "take" | "salt" | "start" | "end" | "type" | "signature"
>

export type SimpleRaribleV2Order = Pick<
  RaribleV2Order,
  "data" | "maker" | "taker" | "make" | "take" | "salt" | "start" | "end" | "type" | "signature"
>

export type SimpleOpenSeaV1Order = Pick<
  OpenSeaV1Order,
  "data" | "maker" | "taker" | "make" | "take" | "salt" | "start" | "end" | "type" | "signature"
>

export type SimpleCryptoPunkOrder = Pick<
  CryptoPunkOrder,
  "data" | "maker" | "taker" | "make" | "take" | "salt" | "start" | "end" | "type" | "signature"
>

export type SimpleSeaportV1Order = Pick<
  SeaportV1Order,
  "data" | "maker" | "taker" | "make" | "take" | "salt" | "start" | "end" | "type" | "signature" | "hash"
>

export type SimpleLooksrareOrder = Pick<
  LooksRareOrder,
  "data" | "maker" | "taker" | "make" | "take" | "salt" | "start" | "end" | "type" | "signature"
>

export type SimpleLooksrareV2Order = Pick<
  LooksRareV2Order,
  "data" | "maker" | "taker" | "make" | "take" | "salt" | "start" | "end" | "type" | "signature"
>

export type SimpleX2Y2Order = Pick<
  X2Y2Order,
  "data" | "maker" | "taker" | "make" | "take" | "salt" | "start" | "end" | "type" | "signature"
>

export type SimpleAmmOrder = Pick<
  AmmOrder,
  "data" | "maker" | "taker" | "make" | "take" | "salt" | "start" | "end" | "type" | "signature"
>

export type SimpleOrder =
  | SimpleLegacyOrder
  | SimpleRaribleV2Order
  | SimpleOpenSeaV1Order
  | SimpleCryptoPunkOrder
  | SimpleSeaportV1Order
  | SimpleLooksrareOrder
  | SimpleLooksrareV2Order
  | SimpleX2Y2Order
  | SimpleAmmOrder

export type UpsertSimpleOrder = SimpleLegacyOrder | SimpleRaribleV2Order
