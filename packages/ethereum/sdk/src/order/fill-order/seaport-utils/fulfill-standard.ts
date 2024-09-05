import { ZERO_ADDRESS } from "@rarible/types"
import type { BigNumber } from "@rarible/utils"
import type { BigNumberValue } from "@rarible/utils"
import type { EthereumContract } from "@rarible/ethereum-provider"
import { hasMessage } from "@rarible/ethereum-provider/build/sign-typed-data"
import type { OrderFillSendData } from "../types"
import { getAdvancedOrderNumeratorDenominator } from "./fulfill"
import { generateCriteriaResolvers } from "./criteria"
import type { ConsiderationItem, InputCriteria, Order, OrderStruct } from "./types"
import { getSummedTokenAndIdentifierAmounts, isCriteriaItem } from "./item"
import type { TimeBasedItemParams } from "./item"
import { mapOrderAmountsFromFilledStatus, mapOrderAmountsFromUnitsToFill } from "./order"
import { mapTipAmountsFromUnitsToFill } from "./map-tips"

export async function getFulfillStandardOrderData({
  order,
  unitsToFill = 0,
  totalSize,
  totalFilled,
  offerCriteria,
  considerationCriteria,
  tips = [],
  extraData,
  timeBasedItemParams,
  conduitKey,
  recipientAddress,
  seaportContract,
}: {
  order: Order
  unitsToFill?: BigNumberValue
  totalFilled: BigNumber
  totalSize: BigNumber
  offerCriteria: InputCriteria[]
  considerationCriteria: InputCriteria[]
  tips?: ConsiderationItem[]
  extraData?: string
  conduitKey: string
  recipientAddress: string
  timeBasedItemParams: TimeBasedItemParams
  seaportContract: EthereumContract
}): Promise<OrderFillSendData> {
  // If we are supplying units to fill, we adjust the order by the minimum of the amount to fill and
  // the remaining order left to be fulfilled
  const orderWithAdjustedFills = unitsToFill
    ? mapOrderAmountsFromUnitsToFill(order, {
        unitsToFill,
        totalSize,
      })
    : // Else, we adjust the order by the remaining order left to be fulfilled
      mapOrderAmountsFromFilledStatus(order, {
        totalFilled,
        totalSize,
      })

  const {
    parameters: { offer, consideration },
  } = orderWithAdjustedFills

  let adjustedTips: ConsiderationItem[] = []

  if (tips.length > 0) {
    adjustedTips = mapTipAmountsFromUnitsToFill(tips, unitsToFill, totalSize)
    console.log("mapTipAmountsFromUnitsToFill", adjustedTips)
  }

  const considerationIncludingTips = [...consideration, ...adjustedTips]

  const offerCriteriaItems = offer.filter(({ itemType }) => isCriteriaItem(itemType))

  const considerationCriteriaItems = considerationIncludingTips.filter(({ itemType }) => isCriteriaItem(itemType))

  const hasCriteriaItems = offerCriteriaItems.length > 0 || considerationCriteriaItems.length > 0

  if (
    offerCriteriaItems.length !== offerCriteria.length ||
    considerationCriteriaItems.length !== considerationCriteria.length
  ) {
    throw new Error("You must supply the appropriate criterias for criteria based items")
  }

  const totalNativeAmount = getSummedTokenAndIdentifierAmounts({
    items: considerationIncludingTips,
    criterias: considerationCriteria,
    timeBasedItemParams: {
      ...timeBasedItemParams,
      isConsiderationItem: true,
    },
  })[ZERO_ADDRESS]?.["0"]

  const isGift = recipientAddress !== ZERO_ADDRESS

  const useAdvanced = Boolean(unitsToFill) || hasCriteriaItems || isGift

  const orderAccountingForTips: OrderStruct = {
    ...order,
    parameters: {
      ...order.parameters,
      consideration: [...order.parameters.consideration, ...tips],
      totalOriginalConsiderationItems: consideration.length,
    },
  }

  const { numerator, denominator } = getAdvancedOrderNumeratorDenominator(order, unitsToFill)

  if (useAdvanced) {
    let functionCall = await seaportContract.functionCall(
      "fulfillAdvancedOrder",
      {
        ...orderAccountingForTips,
        numerator,
        denominator,
        extraData: extraData ?? "0x",
      },
      hasCriteriaItems
        ? generateCriteriaResolvers({
            orders: [order],
            offerCriterias: [offerCriteria],
            considerationCriterias: [considerationCriteria],
          })
        : [],
      conduitKey,
      recipientAddress,
    )
    try {
      await functionCall.estimateGas({ value: totalNativeAmount?.toFixed() || "0" })
    } catch (e: unknown) {
      if (hasMessage(e) && e.message.includes("0xc63cf089")) {
        const orderAccountingForTips: OrderStruct = {
          ...order,
          parameters: {
            ...order.parameters,
            consideration: [...order.parameters.consideration],
            totalOriginalConsiderationItems: consideration.length,
          },
        }
        functionCall = await seaportContract.functionCall(
          "fulfillAdvancedOrder",
          {
            ...orderAccountingForTips,
            numerator,
            denominator,
            extraData: extraData ?? "0x",
          },
          hasCriteriaItems
            ? generateCriteriaResolvers({
                orders: [order],
                offerCriterias: [offerCriteria],
                considerationCriterias: [considerationCriteria],
              })
            : [],
          conduitKey,
          recipientAddress,
        )
      }
    }
    return {
      functionCall,
      options: { value: totalNativeAmount?.toFixed() || "0" },
    }
  }

  const functionCall = await seaportContract.functionCall("fulfillOrder", orderAccountingForTips, conduitKey)
  return {
    functionCall,
    options: { value: totalNativeAmount?.toFixed() || "0" },
  }
}
