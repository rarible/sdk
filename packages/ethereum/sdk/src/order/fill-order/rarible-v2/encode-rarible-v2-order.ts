import type { Ethereum } from "@rarible/ethereum-provider"
import { EVM_ZERO_ADDRESS } from "@rarible/types"
import type { SimpleRaribleV2Order } from "../../types"
import { encodeRaribleV2OrderData } from "../../encode-rarible-v2-order-data"
import { assetTypeToStruct } from "../../asset-type-to-struct"

/**
 * Encode RaribleV2 orders into Purchase struct for directBuy/batchPurchase
 * @param ethereum
 * @param sellOrder
 * @param sellOrderSignature
 * @param buyOrder
 * @param withMethodId add directPurchase method signature prefix
 */
export function encodeRaribleV2OrderPurchaseStruct(
  ethereum: Ethereum,
  sellOrder: SimpleRaribleV2Order,
  sellOrderSignature: string,
  buyOrder: SimpleRaribleV2Order,
  withMethodId: boolean,
): string {
  const nftStruct = assetTypeToStruct(ethereum, sellOrder.make.assetType)
  const [sellOrderDataType, sellOrderData] = encodeRaribleV2OrderData(ethereum, sellOrder.data)
  const [, buyOrderData] = encodeRaribleV2OrderData(ethereum, buyOrder.data)
  const encodedStruct = ethereum.encodeParameter(PURCHASE_STRUCT, {
    sellOrderMaker: sellOrder.maker,
    sellOrderNftAmount: sellOrder.make.value,
    nftAssetClass: nftStruct.assetClass,
    nftData: nftStruct.data,
    sellOrderPaymentAmount: sellOrder.take.value,
    paymentToken: sellOrder.take.assetType.assetClass === "ETH" ? EVM_ZERO_ADDRESS : sellOrder.take.assetType.contract,
    sellOrderSalt: sellOrder.salt,
    sellOrderStart: sellOrder.start ?? 0,
    sellOrderEnd: sellOrder.end ?? 0,
    sellOrderDataType: sellOrderDataType,
    sellOrderData: sellOrderData,
    sellOrderSignature: sellOrderSignature,

    buyOrderPaymentAmount: buyOrder.make.value,
    buyOrderNftAmount: buyOrder.take.value,
    buyOrderData: buyOrderData,
  })

  return withMethodId ? "0x0d5f7d35" + encodedStruct.slice(2) : encodedStruct
}

const SELL_ORDER_FIELDS = [
  {
    name: "sellOrderMaker",
    type: "address",
  },
  {
    name: "sellOrderNftAmount",
    type: "uint256",
  },
  {
    name: "nftAssetClass",
    type: "bytes4",
  },
  {
    name: "nftData",
    type: "bytes",
  },
  {
    name: "sellOrderPaymentAmount",
    type: "uint256",
  },
  {
    name: "paymentToken",
    type: "address",
  },
  {
    name: "sellOrderSalt",
    type: "uint256",
  },
  {
    name: "sellOrderStart",
    type: "uint",
  },
  {
    name: "sellOrderEnd",
    type: "uint",
  },
  {
    name: "sellOrderDataType",
    type: "bytes4",
  },
  {
    name: "sellOrderData",
    type: "bytes",
  },
  {
    name: "sellOrderSignature",
    type: "bytes",
  },
]

const BUY_ORDER_FIELDS = [
  {
    name: "buyOrderPaymentAmount",
    type: "uint256",
  },
  {
    name: "buyOrderNftAmount",
    type: "uint256",
  },
  {
    name: "buyOrderData",
    type: "bytes",
  },
]

const PURCHASE_STRUCT = {
  components: [...SELL_ORDER_FIELDS, ...BUY_ORDER_FIELDS],
  name: "data",
  type: "tuple",
}
