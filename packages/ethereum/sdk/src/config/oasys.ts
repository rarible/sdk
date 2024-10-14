import { toEVMAddress, EVM_ZERO_ADDRESS } from "@rarible/types"
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
    v1: EVM_ZERO_ADDRESS,
    v2: toEVMAddress("0xfD79EF502b5b97E86804A9359fE5Ba48AB3658c5"),
    openseaV1: EVM_ZERO_ADDRESS,
    wrapper: toEVMAddress("0xa3af07132CeA0573880B25d4f89653ab87774c4c"),
    looksrare: EVM_ZERO_ADDRESS,
    looksrareV2: EVM_ZERO_ADDRESS,
    x2y2: EVM_ZERO_ADDRESS,
  },
  transferProxies: {
    nft: toEVMAddress("0x9ABc3Ce3a35873274dE3B8b6c15D3BD1F6F2Ec8D"),
    erc20: toEVMAddress("0x15FCB776c6A0E050FF0e9b423a0EAD1F0dfE1196"),
    erc721Lazy: toEVMAddress("0x56b666895EFab1fb4Fa29298F390c380126d581c"),
    erc1155Lazy: toEVMAddress("0x7698983DF7cd2A57aCDF97656aebFf64398A60a7"),
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
    erc721: toEVMAddress("0xEe962828d39ec46962B883bfFeBa0721499d435C"),
    erc1155: toEVMAddress("0xD9Cb91C9b6Aa00e75ef856557CA86371599be3e8"),
  },
  cryptoPunks: {
    marketContract: EVM_ZERO_ADDRESS,
    wrapperContract: EVM_ZERO_ADDRESS,
  },
  sudoswap: {
    pairFactory: EVM_ZERO_ADDRESS,
    pairRouter: EVM_ZERO_ADDRESS,
  },
  weth: toEVMAddress("0x5200000000000000000000000000000000000001"),
  auction: EVM_ZERO_ADDRESS,
}
