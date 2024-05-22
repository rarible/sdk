import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const arbitrumConfig: EthereumConfig = {
  basePath: "https://arbitrum-api.rarible.org",
  chainId: 42161,
  environment: "production",
  exchange: {
    v1: ZERO_ADDRESS,
    v2: toAddress("0x07b637739CAd9A5f0c487219B283a52717E69978"),
    openseaV1: ZERO_ADDRESS,
    wrapper: ZERO_ADDRESS,
    looksrare: ZERO_ADDRESS,
    looksrareV2: ZERO_ADDRESS,
    x2y2: ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toAddress("0x49b4e47079d9b733B2227fa15f0762dBF707B263"),
    erc20: toAddress("0xDD28328257a2Cce3204332C747Cc350153937A1D"),
    erc721Lazy: toAddress("0x0E63021A7597B254484b7F99dDD9b319591350B6"),
    erc1155Lazy: toAddress("0x1Bea70C8c949b3b8d1188cb738432B121B83C4b5"),
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
  weth: toAddress("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"),
  auction: ZERO_ADDRESS,
  looksrareOrderValidatorV2: ZERO_ADDRESS,
}
