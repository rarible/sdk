import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const devPolygonConfig: EthereumConfig = {
  basePath: "https://dev-polygon-api.rarible.org",
  chainId: 300501,
  environment: "dev",
  blockchain: Blockchain.POLYGON,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x8283Ffd0F535E1103C3599D2d00b85815774A896"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x3586d3E6CDaE98d5F0eEaB737977Bc78406Da2BD"),
    erc20: toEVMAddress("0xeC47DA9591FC24F5a5F401e8D275526Cc5eE5d37"),
    erc721Lazy: toEVMAddress("0x8812cFb55853da0968a02AaaEA84CD93EC4b42A1"),
    erc1155Lazy: toEVMAddress("0x87ECcc03BaBC550c919Ad61187Ab597E9E7f7C21"),
    openseaV1: EVM_ZERO_ADDRESS,
    cryptoPunks: toEVMAddress("0x44a72AEb7dAc73c4b72f89d6855dE063949627F3"),
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: EVM_ZERO_ADDRESS,
  },
  factories: {
    erc721: toEVMAddress("0x66611f8D97688A0aF08D4337D7846eFEc6995d58"),
    erc1155: toEVMAddress("0x31C827f06E10e4999eb88c193669d408eF597B3D"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x328823f69a0915c9BEc366Eb09ccdfB964f91Ad5"),
  auction: EVM_ZERO_ADDRESS,
}
