import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const moonbeamMainnetConfig: EthereumConfig = {
  basePath: "https://moonbeam-api.rarible.org",
  chainId: 1284,
  environment: "production",
  exchange: {
    v1: ZERO_ADDRESS,
    v2: toAddress("0x30fc6eed1d302F5f5C4a8aa58047d1a730b3Cc91"),
    openseaV1: ZERO_ADDRESS,
    wrapper: toAddress("0xEA26e060cCc11C840e6107cfca0B41c45Ce6a5a2"),
    looksrare: ZERO_ADDRESS,
    looksrareV2: ZERO_ADDRESS,
    x2y2: ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toAddress("0x57559104c0e4fbc578fF4251b63eA0903d7CAe32"),
    erc20: toAddress("0x4217a346C8b48731641327b65bb6F6d3243d64e2"),
    erc721Lazy: toAddress("0x13b05523634ABb96E6017Da71b7698CAecDf50b2"),
    erc1155Lazy: toAddress("0x339e61eb644A29B134D7fD3fA589C6b3ca184111"),
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
    erc721: toAddress("0x726f5DD8a1fFAa349bD57501Ba760AB5A03e91Ff"),
    erc1155: toAddress("0x55A921a57f7F15dF2f229Ab9889506Ca89310800"),
  },
  cryptoPunks: {
    marketContract: ZERO_ADDRESS,
    wrapperContract: ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: ZERO_ADDRESS,
    pairRouter: ZERO_ADDRESS,
  },
  weth: toAddress("0xab3f0245b83feb11d15aaffefd7ad465a59817ed"),
  auction: ZERO_ADDRESS,
  looksrareOrderValidatorV2: ZERO_ADDRESS,
}
