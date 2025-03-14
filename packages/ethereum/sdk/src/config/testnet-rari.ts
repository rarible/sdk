import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const rariTestnetConfig: EthereumConfig = {
  basePath: "https://testnet-rari-api.rarible.org",
  chainId: 1918988905,
  environment: "testnet",
  blockchain: Blockchain.RARI,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x61512179F6a16bEC0D259d8010CC0485CE363868"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x3049455cdA17beE43d61090Ec344624aeda72Ed6"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x00C74eD067Cea48F1D6F7D00aBABa3C1D5B2598b"),
    erc20: toEVMAddress("0xA094E566b61b3c2D88ACf7Cc15e3Dd0FA83F32af"),
    erc721Lazy: toEVMAddress("0xB8863180CAC2d0Ab665e5968C0De25298A1D8CEe"),
    erc1155Lazy: toEVMAddress("0xa2eEBb837aEF89369Ad117568d75348e6174520e"),
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
    erc721: toEVMAddress("0x41407B447Fb5425187A9BCA3a062644EF2410F8D"),
    erc1155: toEVMAddress("0xc798B273FaF23932Cf11177402C10C9b44D30Da2"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x2c9dd2b2cd55266e3b5c3c95840f3c037fbcb856"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
