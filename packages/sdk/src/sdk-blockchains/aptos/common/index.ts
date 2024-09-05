import type { UnionAddress } from "@rarible/types"
import { toCollectionId, toContractAddress, toCurrencyId, toItemId, toOrderId, toUnionAddress } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { retry } from "@rarible/sdk-common"
import { ENCODED_APT_TOKEN_TYPE } from "@rarible/aptos-sdk"
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

export async function awaitAllUserItems(sdk: IRaribleSdk, user: UnionAddress) {
  return retry(10, 4000, async () => {
    const items = await sdk.apis.item.getItemsByOwner({
      owner: user,
    })
    if (!items.items.length) throw new Error("No items")
    return items.items
  })
}
