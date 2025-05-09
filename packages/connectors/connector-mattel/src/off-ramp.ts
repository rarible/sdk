import type { AxiosInstance } from "axios"
import axios from "axios"
import type { AssetType, BigNumberLike, UnionAddress } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import { extractBlockchainFromAssetType, getEntityData, validateBlockchain, FLOW_TOKEN_MAP } from "@rarible/sdk-common"
import { toContractAddress, toUnionContractAddress } from "@rarible/types"

const OFFRAMP_URLS = {
  PROD: "https://crypto.sardine.ai",
  SANDBOX: "https://crypto.sandbox.sardine.ai",
}

export class OffRampClient {
  private clientToken: string | undefined
  private expiresAt: Date | undefined
  client: AxiosInstance
  private offrampUrl: string
  private availableBlockchains = [Blockchain.ETHEREUM, Blockchain.POLYGON, Blockchain.FLOW].map(blockchain =>
    blockchain.toLowerCase(),
  )
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly env: "prod" | "sandbox",
  ) {
    const isProd = env === "prod"
    this.offrampUrl = isProd ? OFFRAMP_URLS.PROD : OFFRAMP_URLS.SANDBOX
    this.client = axios.create({
      baseURL: isProd ? "https://api.sardine.ai/v1" : "https://api.sandbox.sardine.ai/v1",
      headers: {
        "Content-Type": "application/json",
      },
    })
    this.client.interceptors.request.use(async config => {
      ;(config.headers as Record<string, string>)["Authorization"] = `Basic ${this.getBase64Token()}`
      return config
    })
  }

  private getBase64Token() {
    const stringToEncode = `${this.clientId}:${this.clientSecret}`
    return new Buffer(stringToEncode).toString("base64")
  }

  private async getToken(): Promise<string> {
    if (this.clientToken && this.expiresAt && new Date() < this.expiresAt) {
      return this.clientToken
    }
    try {
      const { data } = await this.client.post(
        "/auth/client-tokens",
        {},
        {
          headers: {
            Authorization: `Basic ${this.getBase64Token()}`,
          },
        },
      )
      this.clientToken = data.clientToken
      this.expiresAt = new Date(data.expiresAt)
      return data.clientToken
    } catch (error) {
      throw error
    }
  }

  async getSupportedTokens(): Promise<Array<ExtendedSupportedToken>> {
    const { data } = await this.client.get("/supported-tokens")
    return (data.data as SupportedToken[])
      .filter(token => this.availableBlockchains.includes(token.network))
      .reduce((acc, token) => {
        if (["ethereum", "polygon"].includes(token.network)) {
          if (token.tokenAddress) {
            acc.push({
              ...token,
              assetType: {
                "@type": "ERC20",
                contract: toContractAddress(`${token.network.toUpperCase()}:${token.tokenAddress}`),
              } as AssetType,
            })
          } else {
            acc.push({
              ...token,
              assetType: {
                "@type": "ETH",
                blockchain: validateBlockchain(token.network.toUpperCase()),
              } as AssetType,
            })
          }
        }
        if (token.network === "flow") {
          const contract =
            token.tokenAddress ?? this.env === "prod" ? FLOW_TOKEN_MAP["prod"] : FLOW_TOKEN_MAP["testnet"]
          acc.push({
            ...token,
            assetType: {
              "@type": "FLOW_FT",
              contract: toUnionContractAddress(`FLOW:${contract}`),
            },
          })
        }
        return acc
      }, [] as ExtendedSupportedToken[])
  }

  async getGeoCoverage() {
    const { data } = await this.client.get("/geo-coverage")
    return data.data
  }

  async getQuotes(o: GetQuotesOptions): Promise<GetQuotesResponse> {
    const availableTokens = await this.getSupportedTokens()
    const userAddressData = o.address && getEntityData(o.address)
    const { symbol, network } = getAssetType(o.assetType, availableTokens, userAddressData?.blockchain)

    const { data } = await this.client.get("/quotes", {
      params: {
        asset_type: symbol,
        asset_amount: o.cryptoAmount,
        currency: o.fiatCurrency,
        network,
        paymentType: o.paymentType || null,
        side: "sell",
        walletAddress: userAddressData?.address || null,
      },
    })
    return data
  }

  async getSellLink(o: GetSellLinkOptions) {
    const availableTokens = await this.getSupportedTokens()
    const userAddressData = o.address && getEntityData(o.address)
    const { symbol, network } = getAssetType(o.assetType, availableTokens, userAddressData?.blockchain)
    const params = {
      address: userAddressData?.address || "",
      fixed_crypto_amount: o.cryptoAmount,
      fixed_fiat_currency: o.fiatCurrency || "",
      asset_type: symbol,
      network,
      client_token: await this.getToken(),
    }
    const urlParams = new URLSearchParams(params)

    return `${this.offrampUrl}/sell?${urlParams.toString()}`
  }
}

export type GetQuotesOptions = {
  assetType: AssetType
  address?: UnionAddress
  cryptoAmount: BigNumberLike | string
  paymentType?: string
  fiatCurrency?: string
}

export type GetSellLinkOptions = {
  address?: UnionAddress
  cryptoAmount: BigNumberLike | string
  fiatCurrency: string
  assetType: AssetType
}
export function getAssetType(assetType: AssetType, availableTokens: SupportedToken[], userBlockchain?: Blockchain) {
  const blockchain = extractBlockchainFromAssetType(assetType) || userBlockchain || Blockchain.ETHEREUM
  const network = blockchain.toLowerCase()
  const contract = "contract" in assetType ? getEntityData(assetType.contract).address : ""
  if (blockchain === Blockchain.FLOW && isFlowToken(contract)) {
    return {
      network,
      symbol: "FLOW",
    }
  }
  const token = availableTokens.find(token => {
    return token.network === network && token.tokenAddress === contract
  })
  if (!token) {
    throw new Error("Token has not been found")
  }

  return {
    network,
    symbol: token.assetSymbol,
  }
}
function isFlowToken(contract: string) {
  return !!contract && [FLOW_TOKEN_MAP["testnet"], FLOW_TOKEN_MAP["prod"]].includes(contract)
}

export type SupportedToken = {
  network: string
  assetSymbol: string
  assetName: string
  chainId: string
  tokenName: string
  token: string
  tokenAddress: string
}

export type ExtendedSupportedToken = SupportedToken & { assetType: AssetType }

export type GetQuotesResponse = {
  quantity: number
  network: string
  assetType: string
  total: number
  currency: string
  expiresAt: string
  paymentType: string
  price: number
  subtotal: number
  transactionFee: number
  networkFee: number
  highNetworkFee: boolean
  minTransactionValue: number
  maxTransactionValue: number
  minTransactionAssetAmount: number
  maxTransactionAssetAmount: number
}
