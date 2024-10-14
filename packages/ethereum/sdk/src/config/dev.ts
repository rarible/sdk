import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const devEthereumConfig: EthereumConfig = {
  basePath: "https://dev-ethereum-api.rarible.org",
  chainId: 300500,
  environment: "dev",
  blockchain: Blockchain.ETHEREUM,
  exchange: {
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0x3fB287d1Da10a10A87b613dED57230964e546719"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0x8edcb67dd394AFfe535BfedF8B2ed191Be8BCB36"),
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x0b6F1b558b3808EA1B10e5ac29cA82c234C7ca4c"),
    erc20: toEVMAddress("0xa721f321f2C3838e6812b1c8b1693e3B1f6a38Bc"),
    erc721Lazy: toEVMAddress("0xc6f33b62A94939E52E1b074c4aC1A801B869fDB2"),
    erc1155Lazy: toEVMAddress("0x3586d3E6CDaE98d5F0eEaB737977Bc78406Da2BD"),
    openseaV1: EVM_ZERO_ADDRESS,
    cryptoPunks: EVM_ZERO_ADDRESS,
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: EVM_ZERO_ADDRESS,
  },
  factories: {
    erc721: toEVMAddress("0x6aABb267a1c440CfB5C200Ebcd078Efa9249492A"),
    erc1155: toEVMAddress("0x8283Ffd0F535E1103C3599D2d00b85815774A896"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: toEVMAddress("0x6972347e66A32F40ef3c012615C13cB88Bf681cc"),
    pairRouter: toEVMAddress("0x319c4Bd373d3F16697d630153F5a2d526047FD8C"),
  },
  weth: toEVMAddress("0x3554BA6cb4862C7CB2463f461deF81FA4A8f8E3C"),
  auction: EVM_ZERO_ADDRESS,
}
