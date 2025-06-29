import type {
  EthErc20AssetType,
  EthEthereumAssetType,
  FlowAssetTypeFt,
  UnionContractAddress,
} from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { ContractAddress } from "@rarible/types"
import { toUnionContractAddress } from "@rarible/types"
import type { CurrencyType, RequestCurrency } from "@rarible/sdk/build/common/domain"
import type { SolanaSolAssetType } from "@rarible/api-client/build/models/AssetType"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"

function getEthNative(blockchain: Blockchain): EthEthereumAssetType {
  return {
    "@type": "ETH",
    blockchain,
  }
}

function getERC20(contract: ContractAddress | UnionContractAddress): EthErc20AssetType {
  return {
    "@type": "ERC20",
    contract: toUnionContractAddress(contract),
  }
}

const solanaNative: SolanaSolAssetType = {
  "@type": "SOLANA_SOL",
}

const flowNative: FlowAssetTypeFt = {
  "@type": "FLOW_FT",
  contract: toUnionContractAddress("FLOW:A.7e60df042a9c0868.FlowToken"),
}

const flowUSDC: FlowAssetTypeFt = {
  "@type": "FLOW_FT",
  contract: toUnionContractAddress("FLOW:A.a983fecbed621163.FiatToken"),
}

const aptosNative = {
  "@type": "CURRENCY_NATIVE",
  blockchain: Blockchain.APTOS,
} as const

const eclipseNative = {
  "@type": "CURRENCY_NATIVE",
  blockchain: Blockchain.ECLIPSE,
} as const

export type CurrencyOption =
  | {
      type: "NATIVE"
      label: string
      blockchain: Blockchain
    }
  | {
      type: "TOKEN"
      label: string
      blockchain: Blockchain
      contract: string | null
    }

export function getCurrency(
  blockchain: Blockchain,
  type: CurrencyOption["type"],
  contract: ContractAddress,
): RequestCurrency {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
    case Blockchain.POLYGON: {
      if (type === "NATIVE") return getEthNative(blockchain)
      if (type === "TOKEN") return getERC20(contract)
      throw new Error("Unsupported option subtype")
    }
    // @todo it must support native tokens as well
    case Blockchain.MANTLE:
    case Blockchain.ARBITRUM:
    case Blockchain.ZKSYNC:
    case Blockchain.CHILIZ:
    case Blockchain.ASTARZKEVM:
    case Blockchain.RARI:
    case Blockchain.BASE:
      if (type === "TOKEN") return getERC20(contract)
      throw new Error("Unsupported option subtype")
    case Blockchain.IMMUTABLEX:
      if (type === "NATIVE") return getEthNative(blockchain)
      throw new Error("Unsupported option subtype")

      throw new Error("Unsupported option subtype")
    case Blockchain.SOLANA:
      if (type === "NATIVE") return solanaNative
      throw new Error("Unsupported blockchain or asset type")
    case Blockchain.ECLIPSE:
      if (type === "NATIVE") return eclipseNative
      throw new Error("Unsupported blockchain or asset type")
    case Blockchain.FLOW:
      if (type === "NATIVE") return flowNative
      if (type === "TOKEN" && contract === flowUSDC.contract) return flowUSDC
      throw new Error("Unsupported currency subtype")
    case Blockchain.APTOS:
      return aptosNative
    default:
      throw new Error("Unsupported blockchain")
  }
}

export function getCurrencyOptions(
  supportedCurrencies: CurrencyType[],
  environment: RaribleSdkEnvironment,
): CurrencyOption[] {
  return supportedCurrencies.flatMap(currency => {
    switch (currency.blockchain) {
      case Blockchain.ETHEREUM:
        if (currency.type === "NATIVE") {
          return { type: "NATIVE", label: "ETH", blockchain: Blockchain.ETHEREUM }
        } else if (currency.type === "ERC20") {
          const res: CurrencyOption[] = []
          switch (environment) {
            case "development":
              res.push({
                type: "TOKEN",
                label: "Rarible Test ERC20",
                blockchain: Blockchain.ETHEREUM,
                contract: "ETHEREUM:0xA4A70E8627e858567a9f1F08748Fe30691f72b9e",
              })
              break
            case "testnet":
              res.push({
                type: "TOKEN",
                label: "Rarible Test ERC20",
                blockchain: Blockchain.ETHEREUM,
                contract: "ETHEREUM:0xCfaF03B6254363bcA1A9D8e529270B5660bF3109",
              })
              res.push({
                type: "TOKEN",
                label: "Goerli WETH",
                blockchain: Blockchain.ETHEREUM,
                contract: "ETHEREUM:0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
              })
              break
            case "prod":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.ETHEREUM,
                contract: "ETHEREUM:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              })
              break
            default:
          }
          res.push({
            type: "TOKEN",
            label: "Custom ERC20",
            blockchain: Blockchain.ETHEREUM,
            contract: null,
          })
          return res
        }
        return []
      case Blockchain.POLYGON:
        if (currency.type === "NATIVE") {
          return { type: "NATIVE", label: "ETH", blockchain: Blockchain.POLYGON } as CurrencyOption
        } else if (currency.type === "ERC20") {
          const res: CurrencyOption[] = []
          switch (environment) {
            case "development":
              res.push({
                type: "TOKEN",
                label: "Rarible Test ERC20",
                blockchain: Blockchain.POLYGON,
                contract: "POLYGON:0xf4520E73A0212166C07279428527b9d300295203",
              })
              break
            case "testnet":
              res.push(
                {
                  type: "TOKEN",
                  label: "Rarible Test ERC20",
                  blockchain: Blockchain.POLYGON,
                  contract: "POLYGON:0xd6e804e7EDB5B2AecB31D9cCC9d9F3940a7b4cE2",
                },
                {
                  type: "TOKEN",
                  label: "WETH",
                  blockchain: Blockchain.POLYGON,
                  contract: "POLYGON:0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
                },
              )
              break
            case "prod":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.POLYGON,
                contract: "POLYGON:0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
              })
              break
            default:
          }
          res.push({ type: "TOKEN", label: "Custom ERC20", blockchain: Blockchain.POLYGON, contract: null })
          return res
        }
        return []
      case Blockchain.MANTLE:
        if (currency.type === "ERC20") {
          const res: CurrencyOption[] = []
          switch (environment) {
            case "testnet":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.MANTLE,
                contract: "MANTLE:0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111",
              })
              break
            case "prod":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.MANTLE,
                contract: "MANTLE:0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111",
              })
              break
            default:
          }
          return res
        }
        return []
      case Blockchain.ARBITRUM:
        if (currency.type === "ERC20") {
          const res: CurrencyOption[] = []
          switch (environment) {
            case "testnet":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.ARBITRUM,
                contract: "ARBITRUM:0x980b62da83eff3d4576c647993b0c1d7faf17c73",
              })
              break
            case "prod":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.ARBITRUM,
                contract: "ARBITRUM:0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
              })
              break
            default:
          }
          return res
        }
        return []
      case Blockchain.ZKSYNC:
        if (currency.type === "ERC20") {
          const res: CurrencyOption[] = []
          switch (environment) {
            case "testnet":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.ZKSYNC,
                contract: "ZKSYNC:0x20b28B1e4665FFf290650586ad76E977EAb90c5D",
              })
              break
            case "prod":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.ZKSYNC,
                contract: "ZKSYNC:0x8Ebe4A94740515945ad826238Fc4D56c6B8b0e60",
              })
              break
            default:
          }
          return res
        }
        return []
      case Blockchain.CHILIZ: {
        if (currency.type === "ERC20") {
          const res: CurrencyOption[] = []
          switch (environment) {
            case "testnet":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.CHILIZ,
                contract: "CHILIZ:0x678c34581db0a7808d0aC669d7025f1408C9a3C6",
              })
              break
            case "prod":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.CHILIZ,
                contract: "CHILIZ:0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
              })
              break
            default:
          }
          return res
        }
        return []
      }
      case Blockchain.RARI: {
        if (currency.type === "ERC20") {
          const res: CurrencyOption[] = []
          switch (environment) {
            case "testnet":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.RARI,
                contract: "RARI:0x2c9dd2b2cd55266e3b5c3c95840f3c037fbcb856",
              })
              break
            case "prod":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.RARI,
                contract: "RARI:0xf037540e51D71b2D2B1120e8432bA49F29EDFBD0",
              })
              break
            default:
          }
          return res
        }
        return []
      }
      case Blockchain.BASE: {
        if (currency.type === "ERC20") {
          const res: CurrencyOption[] = []
          switch (environment) {
            case "testnet":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.BASE,
                contract: "BASE:0x4200000000000000000000000000000000000006",
              })
              break
            case "prod":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.BASE,
                contract: "BASE:0x4200000000000000000000000000000000000006",
              })
              break
            default:
          }
          return res
        }
        return []
      }
      case Blockchain.ASTARZKEVM: {
        if (currency.type === "ERC20") {
          const res: CurrencyOption[] = []
          switch (environment) {
            case "testnet":
              res.push({
                type: "TOKEN",
                label: "WETH",
                blockchain: Blockchain.ASTARZKEVM,
                contract: "ASTARZKEVM:0xD8560C88D1DC85f9ED05b25878E366c49B68bEf9",
              })
              break
            default:
          }
          return res
        }
        return []
      }
      case Blockchain.IMMUTABLEX:
        if (currency.type === "NATIVE") {
          return { type: "NATIVE", label: "ETH", blockchain: Blockchain.IMMUTABLEX }
        }
        return []
      case Blockchain.SOLANA:
        if (currency.type === "NATIVE") {
          return { type: "NATIVE", label: "SOL", blockchain: Blockchain.SOLANA }
        }
        return []
      case Blockchain.FLOW:
        if (currency.type === "NATIVE") {
          return [
            { type: "NATIVE", label: "FLOW", blockchain: Blockchain.FLOW },
            {
              type: "TOKEN",
              label: "USDC",
              blockchain: Blockchain.FLOW,
              contract: "FLOW:A.a983fecbed621163.FiatToken",
            },
          ]
        }
        return []
      case Blockchain.APTOS:
        if (currency.type === "NATIVE") {
          return { type: "NATIVE", label: "APT", blockchain: Blockchain.APTOS }
        }
        return []
      case Blockchain.ECLIPSE:
        if (currency.type === "NATIVE") {
          return { type: "NATIVE", label: "ETH", blockchain: Blockchain.ECLIPSE }
        }
        return []
      default:
        throw new Error("Unsupported blockchain")
    }
  })
}
