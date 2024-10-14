import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const testnetSaakuruConfig: EthereumConfig = {
  basePath: "https://testnet-saakuru-api.rarible.org",
  chainId: 247253,
  environment: "testnet",
  blockchain: Blockchain.SAAKURU,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x61512179F6a16bEC0D259d8010CC0485CE363868"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0xc798B273FaF23932Cf11177402C10C9b44D30Da2"),
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
    erc721: toEVMAddress("0xe10605b2026884aCc669C2A9Cd4A5ec5f5FFf494"),
    erc1155: toEVMAddress("0x57B3f3b79F64c475a37E6c493BAA8E6E7C5F748e"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x7bc8b1B5AbA4dF3Be9f9A32daE501214dC0E4f3f"),
  auction: EVM_ZERO_ADDRESS,
}
