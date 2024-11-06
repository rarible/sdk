import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const saakuruConfig: EthereumConfig = {
  basePath: "https://saakuru-api.rarible.org",
  chainId: 7225878,
  environment: "production",
  blockchain: Blockchain.SAAKURU,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0xEbAB63727F1E9163B34CD862388cE33Bd5Be3199"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: EVM_ZERO_ADDRESS,
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x39C41C685D26d0219D4717235C2bf6E56055fa4d"),
    erc20: toEVMAddress("0xbd426Ce20Ac84ad3a6FA6FF50cfe5fB325AB0e5d"),
    erc721Lazy: toEVMAddress("0x9847154Ec2d4009c2F067926d554F0d3986e1f64"),
    erc1155Lazy: toEVMAddress("0xdC612825cc0Ab6e2CCDf0Cb4E45D4C68D69E21b4"),
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
    erc721: toEVMAddress("0x9f283cA6a29864F32ec44879Fc4B509ab3277eeD"),
    erc1155: toEVMAddress("0x96992D63fE4317C7a99f0Ec2a2C0CcbC640fD29a"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x557a526472372f1f222ecc6af8818c1e6e78a85f"),
  auction: EVM_ZERO_ADDRESS,
}
