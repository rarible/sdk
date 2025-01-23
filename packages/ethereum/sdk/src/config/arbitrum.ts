import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const arbitrumConfig: EthereumConfig = {
  basePath: "https://arbitrum-api.rarible.org",
  chainId: 42161,
  environment: "production",
  blockchain: Blockchain.ARBITRUM,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x07b637739CAd9A5f0c487219B283a52717E69978"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x13b05523634ABb96E6017Da71b7698CAecDf50b2"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x49b4e47079d9b733B2227fa15f0762dBF707B263"),
    erc20: toEVMAddress("0xDD28328257a2Cce3204332C747Cc350153937A1D"),
    erc721Lazy: toEVMAddress("0x0E63021A7597B254484b7F99dDD9b319591350B6"),
    erc1155Lazy: toEVMAddress("0x1Bea70C8c949b3b8d1188cb738432B121B83C4b5"),
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
    erc721: toEVMAddress("0xdA12E4Ab1d731F29bF4Bff8f971579D95f8DDD07"),
    erc1155: toEVMAddress("0xEA26e060cCc11C840e6107cfca0B41c45Ce6a5a2"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
