import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const chilizConfig: EthereumConfig = {
  basePath: "https://chiliz-api.rarible.org",
  chainId: 88888,
  environment: "production",
  exchange: {
    v1: ZERO_ADDRESS,
    v2: toAddress("0xdA12E4Ab1d731F29bF4Bff8f971579D95f8DDD07"),
    openseaV1: ZERO_ADDRESS,
    wrapper: toAddress("0xEe07D8603F4A8A72B523314D0D473a6Ce93354Fe"),
    looksrare: ZERO_ADDRESS,
    looksrareV2: ZERO_ADDRESS,
    x2y2: ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toAddress("0x8d5D3e1e6609A798B84160Ec9CC25198B9e4F177"),
    erc20: toAddress("0x0B7Acd053BC236fc95537e2aDD37C22968b48C1b"),
    erc721Lazy: toAddress("0x519D6A81b2894FC5e0F2a8B900F6f5CdE1132dBB"),
    erc1155Lazy: toAddress("0x726f5DD8a1fFAa349bD57501Ba760AB5A03e91Ff"),
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
  weth: toAddress("0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"),
  auction: ZERO_ADDRESS,
  looksrareOrderValidatorV2: ZERO_ADDRESS,
}
