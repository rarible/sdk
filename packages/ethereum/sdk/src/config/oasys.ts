import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const oasysConfig: EthereumConfig = {
  basePath: "https://oasys-api.rarible.org",
  chainId: 248,
  environment: "production",
  blockchain: Blockchain.OASYS,
  exchange: {
    v1: ZERO_ADDRESS,
    v2: toAddress(""),
    openseaV1: ZERO_ADDRESS,
    wrapper: toAddress(""),
    looksrare: ZERO_ADDRESS,
    looksrareV2: ZERO_ADDRESS,
    x2y2: ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toAddress("0x9ABc3Ce3a35873274dE3B8b6c15D3BD1F6F2Ec8D"),
    erc20: toAddress("0x15FCB776c6A0E050FF0e9b423a0EAD1F0dfE1196"),
    erc721Lazy: toAddress("0x56b666895EFab1fb4Fa29298F390c380126d581c"),
    erc1155Lazy: toAddress("0x7698983DF7cd2A57aCDF97656aebFf64398A60a7"),
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
    erc721: toAddress("0xEe962828d39ec46962B883bfFeBa0721499d435C"),
    erc1155: toAddress("0xD9Cb91C9b6Aa00e75ef856557CA86371599be3e8"),
  },
  cryptoPunks: {
    marketContract: ZERO_ADDRESS,
    wrapperContract: ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: ZERO_ADDRESS,
    pairRouter: ZERO_ADDRESS,
  },
  weth: toAddress("0x5200000000000000000000000000000000000001"),
  auction: ZERO_ADDRESS,
}
