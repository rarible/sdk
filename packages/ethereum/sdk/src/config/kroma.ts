import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const kromaConfig: EthereumConfig = {
  basePath: "https://kroma-api.rarible.org",
  chainId: 255,
  environment: "production",
  blockchain: Blockchain.KROMA,
  exchange: {
    v1: ZERO_ADDRESS,
    v2: toAddress("0x418f1b76448866CF072dd14d092138190CcdC9aF"),
    openseaV1: ZERO_ADDRESS,
    wrapper: toAddress("0x69Be0b6f5BB5e9F8DfAA1562F06427142fb0a10a"),
    looksrare: ZERO_ADDRESS,
    looksrareV2: ZERO_ADDRESS,
    x2y2: ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toAddress("0x30fc6eed1d302F5f5C4a8aa58047d1a730b3Cc91"),
    erc20: toAddress("0x6C65a3C3AA67b126e43F86DA85775E0F5e9743F7"),
    erc721Lazy: toAddress("0x9f4CE147beF144a571c1372cd6e1DEB148742027"),
    erc1155Lazy: toAddress("0x8d5D3e1e6609A798B84160Ec9CC25198B9e4F177"),
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
    erc721: toAddress("0x24562E94332f06F1F0aEa79cAf283088F9e1B8A8"),
    erc1155: toAddress("0xbd426Ce20Ac84ad3a6FA6FF50cfe5fB325AB0e5d"),
  },
  cryptoPunks: {
    marketContract: ZERO_ADDRESS,
    wrapperContract: ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: ZERO_ADDRESS,
    pairRouter: ZERO_ADDRESS,
  },
  weth: toAddress("0x4200000000000000000000000000000000000001"),
  auction: ZERO_ADDRESS,
}
