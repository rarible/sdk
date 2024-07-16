import { ZERO_ADDRESS } from "@rarible/types"
import { deepMerge } from "../utils/deep-merge"
import type { DeepPick } from "../utils/deep-pick"
import { id32 } from "../common/id"
import { FEE_CONFIG_URL } from "./common"
import type { EthereumConfig } from "./type"

type EtheriumConfigRequiredFields = DeepPick<
  EthereumConfig,
  | "basePath"
  | "chainId"
  | "environment"
  | "weth"
  | "exchange.v2"
  | "exchange.wrapper"
  | "transferProxies.nft"
  | "transferProxies.erc20"
  | "transferProxies.erc721Lazy"
  | "transferProxies.erc1155Lazy"
  | "factories.erc721"
  | "factories.erc1155"
>

const defaultConfig: EthereumConfig = {
  basePath: "",
  chainId: 0,
  environment: "production",
  exchange: {
    v1: ZERO_ADDRESS,
    v2: ZERO_ADDRESS,
    openseaV1: ZERO_ADDRESS,
    wrapper: ZERO_ADDRESS,
    looksrare: ZERO_ADDRESS,
    looksrareV2: ZERO_ADDRESS,
    x2y2: ZERO_ADDRESS,
  },
  transferProxies: {
    nft: ZERO_ADDRESS,
    erc20: ZERO_ADDRESS,
    erc721Lazy: ZERO_ADDRESS,
    erc1155Lazy: ZERO_ADDRESS,
    openseaV1: ZERO_ADDRESS,
    cryptoPunks: ZERO_ADDRESS,
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: ZERO_ADDRESS,
    merkleValidator: ZERO_ADDRESS,
  },
  factories: {
    erc721: ZERO_ADDRESS,
    erc1155: ZERO_ADDRESS,
  },
  cryptoPunks: {
    marketContract: ZERO_ADDRESS,
    wrapperContract: ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: ZERO_ADDRESS,
    pairRouter: ZERO_ADDRESS,
  },
  weth: ZERO_ADDRESS,
  auction: ZERO_ADDRESS,
  looksrareOrderValidatorV2: ZERO_ADDRESS,
}

export function extendConfig(
  additions: EtheriumConfigRequiredFields,
  baseConfig: EthereumConfig = defaultConfig,
): EthereumConfig {
  return deepMerge({}, baseConfig, additions)
}
