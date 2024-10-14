import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const chilizConfig: EthereumConfig = {
  basePath: "https://chiliz-api.rarible.org",
  chainId: 88888,
  environment: "production",
  blockchain: Blockchain.CHILIZ,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0xdA12E4Ab1d731F29bF4Bff8f971579D95f8DDD07"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0xEe07D8603F4A8A72B523314D0D473a6Ce93354Fe"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x8d5D3e1e6609A798B84160Ec9CC25198B9e4F177"),
    erc20: toEVMAddress("0x0B7Acd053BC236fc95537e2aDD37C22968b48C1b"),
    erc721Lazy: toEVMAddress("0x519D6A81b2894FC5e0F2a8B900F6f5CdE1132dBB"),
    erc1155Lazy: toEVMAddress("0x726f5DD8a1fFAa349bD57501Ba760AB5A03e91Ff"),
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
  weth: toEVMAddress("0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
