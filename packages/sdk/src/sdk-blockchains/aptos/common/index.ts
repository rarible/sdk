import type { UnionAddress } from "@rarible/types"
import { toCollectionId, toContractAddress, toCurrencyId, toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { extractId, retry } from "@rarible/sdk-common"
import { ENCODED_APT_TOKEN_TYPE } from "@rarible/aptos-sdk"
import type { UnionPart } from "../../../types/order/common"
import type { IRaribleSdk } from "../../../index"

export const APTOS_APT_CURRENCY = toCurrencyId(`${Blockchain.APTOS}:${ENCODED_APT_TOKEN_TYPE}`)

export function convertAptosToUnionAddress(address: string) {
  return toUnionAddress(`${Blockchain.APTOS}:${address}`)
}

export function convertUnionAddressToAptos(address: UnionAddress) {
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

export async function awaitAllUserItems(sdk: IRaribleSdk, user: UnionAddress) {
  return retry(10, 4000, async () => {
    const items = await sdk.apis.item.getItemsByOwner({
      owner: user,
    })
    if (!items.items.length) throw new Error("No items")
    return items.items
  })
}
