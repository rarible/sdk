import { EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { deepMerge } from "../utils/deep-merge"
import type { DeepPartial } from "../utils/deep-partial"
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
  | "blockchain"
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
  blockchain: Blockchain.ETHEREUM,
  environment: "production",
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: EVM_ZERO_ADDRESS,
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: EVM_ZERO_ADDRESS,
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: EVM_ZERO_ADDRESS,
    erc20: EVM_ZERO_ADDRESS,
    erc721Lazy: EVM_ZERO_ADDRESS,
    erc1155Lazy: EVM_ZERO_ADDRESS,
    openseaV1: EVM_ZERO_ADDRESS,
    cryptoPunks: EVM_ZERO_ADDRESS,
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: EVM_ZERO_ADDRESS,
    merkleValidator: EVM_ZERO_ADDRESS,
  },
  factories: {
    erc721: EVM_ZERO_ADDRESS,
    erc1155: EVM_ZERO_ADDRESS,
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: EVM_ZERO_ADDRESS,
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}

export function extendConfig(
  additions: EtheriumConfigRequiredFields & DeepPartial<EthereumConfig>,
  baseConfig: EthereumConfig = defaultConfig,
): EthereumConfig {
  return deepMerge({}, baseConfig, additions)
}
