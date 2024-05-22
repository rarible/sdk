import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const devEthereumConfig: EthereumConfig = {
  basePath: "https://dev-ethereum-api.rarible.org",
  chainId: 300500,
  environment: "dev",
  exchange: {
    v1: ZERO_ADDRESS,
    v2: toAddress("0x3fB287d1Da10a10A87b613dED57230964e546719"),
    openseaV1: ZERO_ADDRESS,
    wrapper: toAddress("0x8edcb67dd394AFfe535BfedF8B2ed191Be8BCB36"),
    x2y2: ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toAddress("0x0b6F1b558b3808EA1B10e5ac29cA82c234C7ca4c"),
    erc20: toAddress("0xa721f321f2C3838e6812b1c8b1693e3B1f6a38Bc"),
    erc721Lazy: toAddress("0xc6f33b62A94939E52E1b074c4aC1A801B869fDB2"),
    erc1155Lazy: toAddress("0x3586d3E6CDaE98d5F0eEaB737977Bc78406Da2BD"),
    openseaV1: ZERO_ADDRESS,
    cryptoPunks: ZERO_ADDRESS,
  },
  feeConfigUrl: FEE_CONFIG_URL,
  openSea: {
    metadata: id32("RARIBLE"),
    proxyRegistry: ZERO_ADDRESS,
  },
  factories: {
    erc721: toAddress("0x6aABb267a1c440CfB5C200Ebcd078Efa9249492A"),
    erc1155: toAddress("0x8283Ffd0F535E1103C3599D2d00b85815774A896"),
  },
  cryptoPunks: {
    marketContract: ZERO_ADDRESS,
    wrapperContract: ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: toAddress("0x6972347e66A32F40ef3c012615C13cB88Bf681cc"),
    pairRouter: toAddress("0x319c4Bd373d3F16697d630153F5a2d526047FD8C"),
  },
  weth: toAddress("0x3554BA6cb4862C7CB2463f461deF81FA4A8f8E3C"),
  auction: ZERO_ADDRESS,
}
