import { toBigNumber, toCurrencyId, toItemId, toUnionContractAddress, ZERO_ADDRESS } from "@rarible/types"
import type * as ApiClient from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type {
  AssetType,
  EthErc20AssetType,
  EthEthereumAssetType,
  NativeCurrencyAssetType,
  TokenCurrencyAssetType,
} from "@rarible/api-client/build/models/AssetType"
import { extractBlockchain, extractId, isEVMBlockchain } from "@rarible/sdk-common"
import { APT_TOKEN_TYPE, ENCODED_APT_TOKEN_TYPE } from "@rarible/aptos-sdk"
import { ECLIPSE_NATIVE_CURRENCY_ADDRESS } from "@rarible/eclipse-sdk"
import type { RequestCurrency, RequestCurrencyAssetType } from "./domain"

export function getCurrencyAssetType(currency: RequestCurrency): RequestCurrencyAssetType {
  if (isRequestCurrencyAssetType(currency)) {
    return convertCurrencyIdToAssetType(currency)
  } else if (isAssetType(currency)) {
    return currency
  } else {
    throw new Error(`Unrecognized RequestCurrency ${JSON.stringify(currency)}`)
  }
}

export function getCurrencyId(currency: RequestCurrency): ApiClient.CurrencyId {
  if (isAssetType(currency)) {
    return convertAssetTypeToCurrencyId(currency)
  } else if (isRequestCurrencyAssetType(currency)) {
    return currency
  } else {
    throw new Error(`Unrecognized RequestCurrency ${JSON.stringify(currency)}`)
  }
}

export function isRequestCurrencyAssetType(x: RequestCurrency): x is ApiClient.CurrencyId {
  return typeof x === "string" && !!toCurrencyId(x)
}
export function isAssetType(x: RequestCurrency): x is RequestCurrencyAssetType {
  return typeof x === "object" && x !== null && "@type" in x
}

export function isEth(x: AssetType): x is EthEthereumAssetType {
  return x["@type"] === "ETH"
}

export function isErc20(x: AssetType): x is EthErc20AssetType {
  return x["@type"] === "ERC20"
}

export function isNativeCurrencyAssetType(x: AssetType): x is NativeCurrencyAssetType {
  return x["@type"] === "CURRENCY_NATIVE" && !!x.blockchain
}

export function isTokenCurrencyAssetType(x: AssetType): x is TokenCurrencyAssetType {
  return x["@type"] === "CURRENCY_TOKEN" && !!x.contract
}

export function convertAssetTypeToCurrencyId(id: RequestCurrencyAssetType): ApiClient.CurrencyId {
  if (isEth(id)) {
    return toCurrencyId(`${id.blockchain || Blockchain.ETHEREUM}:${ZERO_ADDRESS}`)
  }
  if (isErc20(id)) {
    return toCurrencyId(id.contract)
  }
  if (isNativeCurrencyAssetType(id)) {
    if (id.blockchain === Blockchain.APTOS) {
      return toCurrencyId(`${Blockchain.APTOS}:${ENCODED_APT_TOKEN_TYPE}`)
    }
    if (id.blockchain === Blockchain.ECLIPSE) {
      return toCurrencyId(`${Blockchain.ECLIPSE}:${ECLIPSE_NATIVE_CURRENCY_ADDRESS}`)
    }
  }
  if (isTokenCurrencyAssetType(id)) {
    return toCurrencyId(id.contract)
  }
  throw new Error(`Unsupported currency type: ${id}`)
}

export function convertCurrencyIdToAssetType(id: ApiClient.CurrencyId): RequestCurrencyAssetType {
  const blockchain = extractBlockchain(id)
  const rawId = extractId(id)
  if (blockchain === Blockchain.APTOS) {
    const normalizedId = normalizeId(rawId)
    if (normalizedId === APT_TOKEN_TYPE) {
      return {
        "@type": "CURRENCY_NATIVE",
        blockchain: Blockchain.APTOS,
      }
    }
    return {
      "@type": "CURRENCY_TOKEN",
      contract: toUnionContractAddress(id),
    }
  }
  const { contract, tokenId } = getDataFromCurrencyId(id)
  if (isEVMBlockchain(blockchain) || blockchain === Blockchain.IMMUTABLEX) {
    if (contract === ZERO_ADDRESS) {
      return {
        "@type": "ETH",
        blockchain: blockchain,
      }
    }
    return {
      "@type": "ERC20",
      contract: toUnionContractAddress(`${blockchain}:${contract}`),
    }
  }
  if (blockchain === Blockchain.FLOW) {
    return {
      "@type": "FLOW_FT",
      contract: toUnionContractAddress(id),
    }
  }
  if (blockchain === Blockchain.TEZOS) {
    if (id === XTZ) {
      return {
        "@type": "XTZ",
      }
    }
    return {
      "@type": "TEZOS_FT",
      contract: toUnionContractAddress(`TEZOS:${contract}`),
      tokenId: tokenId ? toBigNumber(tokenId) : undefined,
    }
  }
  if (blockchain === Blockchain.SOLANA || blockchain === Blockchain.ECLIPSE) {
    if (contract === ZERO_ADDRESS) {
      return {
        "@type": "SOLANA_SOL",
      }
    }
    return {
      "@type": "SOLANA_NFT",
      itemId: toItemId("SOLANA:" + contract),
    }
  }
  throw new Error(`Unsupported currency type: ${id}`)
}

/*
  Get data from currency id for non-Aptos IDs
 */
export function getDataFromCurrencyId(id: ApiClient.CurrencyId) {
  const blockchain = extractBlockchain(id)
  if (!(blockchain in Blockchain)) {
    throw new Error(`Unsupported blockchain: ${id}`)
  }
  if (blockchain === Blockchain.APTOS) {
    throw new Error("Current extractor doesn't support Aptos blockchain")
  }
  const extractedId = extractId(id)
  const [contract, tokenId] = extractedId.split(":")
  return {
    blockchain: blockchain as Blockchain,
    id: extractedId,
    contract,
    tokenId,
  }
}

const base64Regex = /^[a-zA-Z0-9+/]*={0,2}$/
export function isValidBase64(input: string) {
  return base64Regex.test(input)
}

export function normalizeId(input: string) {
  try {
    return isValidBase64(input) ? atob(input) : input
  } catch (e) {}
  return input
}

export const XTZ = "TEZOS:tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" as ApiClient.CurrencyId
