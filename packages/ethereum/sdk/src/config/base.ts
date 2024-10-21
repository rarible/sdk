import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const baseConfig: EthereumConfig = {
  basePath: "https://base-api.rarible.org",
  chainId: 8453,
  environment: "production",
  blockchain: Blockchain.BASE,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x6C65a3C3AA67b126e43F86DA85775E0F5e9743F7"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x6563a331A411829918025D8a7e1d348f8b250906"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x4217a346C8b48731641327b65bb6F6d3243d64e2"),
    erc20: toEVMAddress("0x13b05523634ABb96E6017Da71b7698CAecDf50b2"),
    erc721Lazy: toEVMAddress("0x339e61eb644A29B134D7fD3fA589C6b3ca184111"),
    erc1155Lazy: toEVMAddress("0x5faf16A85028BE138A7178B222DeC98092FEEF97"),
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
    erc721: toEVMAddress("0xF965237c6b3f89f8C62B45b94097899E3562A830"),
    erc1155: toEVMAddress("0xd37DC0CD86Dfa9B2B57CD7DFA8B6AA0092a9517d"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x4200000000000000000000000000000000000006"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
