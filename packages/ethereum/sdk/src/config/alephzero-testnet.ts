import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const alephzeroTestnetConfig: EthereumConfig = {
  basePath: "https://testnet-alephzero-api.rarible.org",
  chainId: 11124,
  environment: "testnet",
  blockchain: Blockchain.ALEPHZERO,
  exchange: {
    v1: ZERO_ADDRESS,
    v2: toAddress("0x6667b5ce062115651b0a6f499ac3f24A2DdFCB72"),
    openseaV1: ZERO_ADDRESS,
    wrapper: toAddress("0x1385a6B618f172d6735DE3e1E4222592f58b053B"),
    looksrare: ZERO_ADDRESS,
    looksrareV2: ZERO_ADDRESS,
    x2y2: ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toAddress("0xDa381535565B97640a6453fA7A1A7b161AF78cbE"),
    erc20: toAddress("0x3d3c8f3aCcf388c3618BbE80598692B6d15bd4D5"),
    erc721Lazy: toAddress("0x4e045aBF1e239BfA224c8DCb8F889C3d447D3804"),
    erc1155Lazy: toAddress("0x2eBecaBBbe8a8C629b99aB23ed154d74CD5d4342"),
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
    erc721: toAddress("0xB02f8F8F3527e5b2C7dB72B7eE1Af244fA8B3BAE"),
    erc1155: toAddress("0x7Eabe83e0F99B6bf24Ec3F50994B972DC38D11dF"),
  },
  cryptoPunks: {
    marketContract: ZERO_ADDRESS,
    wrapperContract: ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: ZERO_ADDRESS,
    pairRouter: ZERO_ADDRESS,
  },
  weth: toAddress("0xcC1141eEd15EB519b08cA38A2Ee75AB8025F0DA9"),
  auction: ZERO_ADDRESS,
  looksrareOrderValidatorV2: ZERO_ADDRESS,
}
