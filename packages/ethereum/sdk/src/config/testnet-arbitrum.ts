import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const arbitrumTestnetConfig: EthereumConfig = {
  basePath: "https://testnet-arbitrum-api.rarible.org",
  chainId: 421614,
  environment: "testnet",
  blockchain: Blockchain.ARBITRUM,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x47F6d59216aAdb2e5aA6bFAf0b06d790EdC35118"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: EVM_ZERO_ADDRESS,
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x3049455cdA17beE43d61090Ec344624aeda72Ed6"),
    erc20: toEVMAddress("0x2FCE8435F0455eDc702199741411dbcD1B7606cA"),
    erc721Lazy: toEVMAddress("0x41407B447Fb5425187A9BCA3a062644EF2410F8D"),
    erc1155Lazy: toEVMAddress("0x18a2553ef1aaE12d9cd158821319e26A62feE90E"),
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
    erc721: toEVMAddress("0xE3Baf1b17335bbf3AC3C2cFCe95eC1bfC463d0c8"),
    erc1155: toEVMAddress("0x51929e5710D9cef0EB0388b7866dF20a4598dF26"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x980b62da83eff3d4576c647993b0c1d7faf17c73"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
