import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const baseSepoliaConfig: EthereumConfig = {
  basePath: "https://testnet-base-api.rarible.org",
  chainId: 84532,
  environment: "testnet",
  blockchain: Blockchain.BASE,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x0fE65B68Eb627c21EAF3cfe8183C4F946F3d48BD"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x4fEB488209d2A0A71fEef28E5fA306F15b2D5FEa"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x4f4cC63D7f2bC894078d41f284453062842Afa46"),
    erc20: toEVMAddress("0xBc57D6e50fa760A01536A7c2EAEDD6fC9b2A4f9A"),
    erc721Lazy: toEVMAddress("0xF1cb795B7eA59a9213a790f868104c11a14690Fa"),
    erc1155Lazy: toEVMAddress("0xa90e536A492aef0d57e6d295FA17687c3ca93347"),
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
    erc721: toEVMAddress("0xB020bA7fcF43DCc59eF0103624BD6FADE66d105E"),
    erc1155: toEVMAddress("0x166F6180170f438Ddc38050a2B708d38c0890956"),
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
