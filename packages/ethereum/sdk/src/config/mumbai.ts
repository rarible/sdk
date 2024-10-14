import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const mumbaiConfig: EthereumConfig = {
  basePath: "https://testnet-polygon-api.rarible.org",
  chainId: 80001,
  environment: "testnet",
  blockchain: Blockchain.POLYGON,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x2Fc743F5419637B93dDAC159715B902186300041"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x042221c65AC6925fbc478dB5B746183f72377526"),
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x02e21199D043dab90248f79d6A8d0c36832734B0"),
    erc20: toEVMAddress("0xCA90c2E7d3c41EF220888B0038849BA1e67688bC"),
    erc721Lazy: toEVMAddress("0xA8628124C255171cF356F0E0204E2D19CA89F636"),
    erc1155Lazy: toEVMAddress("0x8fd27f771bf72C1F8c8b78FCdcf323C0C34f030b"),
    openseaV1: EVM_ZERO_ADDRESS,
    cryptoPunks: EVM_ZERO_ADDRESS,
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: EVM_ZERO_ADDRESS,
  },
  factories: {
    erc721: toEVMAddress("0xa85180a21786bA65b0778bE1cb5CBA5E5c6cD21d"),
    erc1155: toEVMAddress("0xAa9CD5834E0009902EeAA3FEfAc6A160e9A096b4"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x9c3c9283d3e44854697cd22d3faa240cfb032889"),
  auction: EVM_ZERO_ADDRESS,
}
