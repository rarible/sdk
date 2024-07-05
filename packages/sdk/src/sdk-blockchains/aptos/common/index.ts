import { toCollectionId, toContractAddress, toCurrencyId, toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { extractId } from "@rarible/sdk-common"
import { ENCODED_APT_TOKEN_TYPE } from "@rarible/aptos-sdk"
import type { UnionPart } from "../../../types/order/common"

export const APTOS_APT_CURRENCY = toCurrencyId(`${Blockchain.APTOS}:${ENCODED_APT_TOKEN_TYPE}`)

export function convertAptosToUnionAddress(address: string) {
  return toUnionAddress(`${Blockchain.APTOS}:${address}`)
}

export function convertAptosToUnionOrderId(orderId: string) {
  return toOrderId(`${Blockchain.APTOS}:${orderId}`)
}
export function convertAptosToUnionCollectionId(collection: string) {
  return toCollectionId(`${Blockchain.APTOS}:${collection}`)
}

export function convertAptosToUnionItemId(item: string) {
  return toItemId(`${Blockchain.APTOS}:${item}`)
}

export function convertAptosToUnionContractAddress(contract: string) {
  return toContractAddress(`${Blockchain.APTOS}:${contract}`)
}

export function getSupportedCurrencies(): [{ blockchain: Blockchain.APTOS; type: "NATIVE" }] {
  return [{ blockchain: Blockchain.APTOS, type: "NATIVE" }]
}

export async function getFeeObject({
  originFees,
  defaultFeeAddress,
  createFeeSchedule,
}: {
  originFees: UnionPart[]
  defaultFeeAddress: string
  createFeeSchedule: (options: { receiveAddress: string; value: number }) => Promise<string>
}): Promise<string> {
  if (!originFees || !originFees.length) return defaultFeeAddress
  if (originFees.length > 1) {
    throw new Error("Origin fees should consist only 1 item")
  }
  if (originFees[0].value === 0) {
    return extractId(originFees[0].account)
  } else if (originFees[0].value > 0) {
    return createFeeSchedule({
      value: originFees[0].value,
      receiveAddress: extractId(originFees[0].account),
    })
  } else {
    throw new Error(`Incorrect originFee value=${originFees[0].value}`)
  }
}
