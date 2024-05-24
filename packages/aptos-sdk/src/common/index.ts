import { toBn } from "@rarible/utils"
import type { MoveResource, WriteSetChange } from "@aptos-labs/ts-sdk"
import { isString, Network } from "@aptos-labs/ts-sdk"
import type { Maybe } from "@rarible/types"
import type { AptosWalletInterface } from "@rarible/aptos-wallet"
import type { AptosSdkEnv } from "../domain"

export const APT_DIVIDER = toBn(10).pow(8)
export const MAX_U64_INT = "18446744073709551615"

export const APT_TOKEN_TYPE = "0x1::aptos_coin::AptosCoin"

export type CURRENCY_TYPE = typeof APT_TOKEN_TYPE

export function isChangeBelongsToType(change: WriteSetChange, dataTypeFn: (dataType: string) => boolean): boolean {
  return (
    change.type === "write_resource" &&
    "data" in change &&
    typeof change.data === "object" &&
    change.data !== null &&
    "type" in change.data &&
    isString(change.data.type) &&
    dataTypeFn(change.data.type)
  )
}

export function getNetworkFromEnv(env: AptosSdkEnv) {
  switch (env) {
    case "testnet":
      return Network.TESTNET
    case "mainnet":
      return Network.MAINNET
    default:
      throw new Error(`Network ${env} has not been recognized`)
  }
}

export function getRequiredWallet<T extends AptosWalletInterface>(wallet: Maybe<T>): T {
  if (!wallet) throw new Error("Aptos wallet doesn't exist")
  return wallet
}

export function makeId(length: number) {
  let result = ""
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy"
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export function getListingTokenType(listingResources: MoveResource[]): CURRENCY_TYPE {
  const priceResource: any = listingResources.find(o => o.type.includes("coin_listing::FixedPriceListing"))
  if (!priceResource?.data?.price) {
    throw new Error("Price object has not been found")
  }
  const match = priceResource.type.match(/<([^>]+)>/)

  const tokenType = match ? match[1] : null
  if (!tokenType) throw new Error("Token type has not been recognized")
  return tokenType
}

export function normalizeAddress(address: string): string {
  if (address.length === 66 && address.startsWith("0x")) return address
  return `0x${address.replace("0x", "").padStart(64, "0")}`
}
