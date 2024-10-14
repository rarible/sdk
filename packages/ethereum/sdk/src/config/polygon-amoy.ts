import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const polygonAmoyConfig: EthereumConfig = {
  basePath: "https://testnet-polygon-api.rarible.org",
  chainId: 80002,
  environment: "testnet",
  blockchain: Blockchain.POLYGON,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x3e52D660b69d1bDacb6C513cE085D924F5Cb9c77"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x2FCE8435F0455eDc702199741411dbcD1B7606cA"),
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0xA094E566b61b3c2D88ACf7Cc15e3Dd0FA83F32af"),
    erc20: toEVMAddress("0xB8863180CAC2d0Ab665e5968C0De25298A1D8CEe"),
    erc721Lazy: toEVMAddress("0xa2eEBb837aEF89369Ad117568d75348e6174520e"),
    erc1155Lazy: toEVMAddress("0xC5BBd75789bD007784A0046094d19aCeA1A79eB1"),
    openseaV1: EVM_ZERO_ADDRESS,
    cryptoPunks: EVM_ZERO_ADDRESS,
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: EVM_ZERO_ADDRESS,
  },
  factories: {
    erc721: toEVMAddress("0x18a2553ef1aaE12d9cd158821319e26A62feE90E"),
    erc1155: toEVMAddress("0xc9eB416CDb5cc2aFC09bb75393AEc6dBA4E5C84a"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x0ae690aad8663aab12a671a6a0d74242332de85f"),
  auction: EVM_ZERO_ADDRESS,
}
