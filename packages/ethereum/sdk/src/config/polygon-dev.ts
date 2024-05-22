import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const devPolygonConfig: EthereumConfig = {
  basePath: "https://dev-polygon-api.rarible.org",
  chainId: 300501,
  environment: "dev",
  exchange: {
    v1: ZERO_ADDRESS,
    v2: toAddress("0x8283Ffd0F535E1103C3599D2d00b85815774A896"),
    openseaV1: ZERO_ADDRESS,
    wrapper: ZERO_ADDRESS,
    x2y2: ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toAddress("0x3586d3E6CDaE98d5F0eEaB737977Bc78406Da2BD"),
    erc20: toAddress("0xeC47DA9591FC24F5a5F401e8D275526Cc5eE5d37"),
    erc721Lazy: toAddress("0x8812cFb55853da0968a02AaaEA84CD93EC4b42A1"),
    erc1155Lazy: toAddress("0x87ECcc03BaBC550c919Ad61187Ab597E9E7f7C21"),
    openseaV1: ZERO_ADDRESS,
    cryptoPunks: toAddress("0x44a72AEb7dAc73c4b72f89d6855dE063949627F3"),
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: ZERO_ADDRESS,
  },
  factories: {
    erc721: toAddress("0x66611f8D97688A0aF08D4337D7846eFEc6995d58"),
    erc1155: toAddress("0x31C827f06E10e4999eb88c193669d408eF597B3D"),
  },
  cryptoPunks: {
    marketContract: ZERO_ADDRESS,
    wrapperContract: ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: ZERO_ADDRESS,
    pairRouter: ZERO_ADDRESS,
  },
  weth: toAddress("0x328823f69a0915c9BEc366Eb09ccdfB964f91Ad5"),
  auction: ZERO_ADDRESS,
}
