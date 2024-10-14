import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const mantleTestnetConfig: EthereumConfig = {
  basePath: "https://testnet-mantle-api.rarible.org",
  chainId: 5003,
  environment: "testnet",
  blockchain: Blockchain.MANTLE,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x41407B447Fb5425187A9BCA3a062644EF2410F8D"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x0141aC79eFD8e4305cE7785B4483C54d5E968995"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0xF1cb795B7eA59a9213a790f868104c11a14690Fa"),
    erc20: toEVMAddress("0xa90e536A492aef0d57e6d295FA17687c3ca93347"),
    erc721Lazy: toEVMAddress("0x61512179F6a16bEC0D259d8010CC0485CE363868"),
    erc1155Lazy: toEVMAddress("0x3e52D660b69d1bDacb6C513cE085D924F5Cb9c77"),
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
    erc721: toEVMAddress("0x4492608238eB09c7AD036e9C089538a7286B8985"),
    erc1155: toEVMAddress("0x552dcDddEd58DAfC95AB1231A9a46E15c34E211A"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111"),
  auction: EVM_ZERO_ADDRESS,
  looksrareOrderValidatorV2: EVM_ZERO_ADDRESS,
}
